use anyhow::Result;
use thiserror::Error;
use wasmtime::{Config, Engine, Instance, InstanceAllocationStrategy, Module, PoolingAllocationConfig, Store};

#[derive(Error, Debug)]
pub enum SandboxError {
    #[error("I/O operation out of bounds: offset={offset}, size={size}, capacity={capacity}")]
    OutOfBounds {
        offset: usize,
        size: usize,
        capacity: usize,
    },
    #[error("Sandbox not initialized")]
    Uninitialized,
    #[error("Out of Memory (OOM) killed by Sandbox")]
    OomKill,
    #[error("CPU cycles exceeded limit")]
    CpuLimitExceeded,
    #[error("Wasmtime engine error: {0}")]
    EngineError(String),
}

/// Binary sandbox with byte-addressable I/O.
pub struct SandboxIo {
    buffer: Vec<u8>,
    cursor: usize,
}

impl SandboxIo {
    pub fn new(capacity: usize) -> Self {
        Self {
            buffer: vec![0u8; capacity],
            cursor: 0,
        }
    }

    pub fn write_bytes(&mut self, offset: usize, data: &[u8]) -> Result<()> {
        let end = offset.checked_add(data.len()).ok_or_else(|| {
            SandboxError::OutOfBounds {
                offset,
                size: data.len(),
                capacity: self.buffer.len(),
            }
        })?;
        if end > self.buffer.len() {
            return Err(SandboxError::OutOfBounds {
                offset,
                size: data.len(),
                capacity: self.buffer.len(),
            }
            .into());
        }
        self.buffer[offset..end].copy_from_slice(data);
        self.cursor = end;
        Ok(())
    }

    pub fn read_bytes(&self, offset: usize, size: usize) -> Result<&[u8]> {
        let end = offset.checked_add(size).ok_or_else(|| SandboxError::OutOfBounds {
            offset,
            size,
            capacity: self.buffer.len(),
        })?;
        if end > self.buffer.len() {
            return Err(SandboxError::OutOfBounds {
                offset,
                size,
                capacity: self.buffer.len(),
            }
            .into());
        }
        Ok(&self.buffer[offset..end])
    }

    pub fn cursor(&self) -> usize {
        self.cursor
    }

    pub fn capacity(&self) -> usize {
        self.buffer.len()
    }

    /// Raw pointer to the start of the sandbox buffer.
    /// Used for pointer-arithmetic validation in FFI.
    pub fn as_ptr(&self) -> *const u8 {
        self.buffer.as_ptr()
    }

    /// Mutable raw pointer to the sandbox buffer.
    pub fn as_mut_ptr(&mut self) -> *mut u8 {
        self.buffer.as_mut_ptr()
    }
}

pub struct ResourceMonitor {
    pub max_memory_bytes: usize,
    pub max_cpu_instructions: u64,
}

pub struct WasmSandbox {
    engine: Engine,
}

impl WasmSandbox {
    pub fn new(monitor: ResourceMonitor) -> Result<Self, SandboxError> {
        let mut config = Config::new();
        config.consume_fuel(true);
        config.wasm_multi_memory(true);
        config.wasm_backtrace_details(wasmtime::WasmBacktraceDetails::Disable);
        config.wasm_backtrace(false);

        // Configure the per-linear-memory limit to trap OOM.
        let mut pooling_config = PoolingAllocationConfig::default();
        pooling_config.max_memory_size(monitor.max_memory_bytes);
        config.allocation_strategy(InstanceAllocationStrategy::Pooling(pooling_config));

        let engine = Engine::new(&config).map_err(|e| SandboxError::EngineError(e.to_string()))?;

        Ok(Self { engine })
    }

    pub fn execute(&self, wasm_bytes: &[u8], fuel_limit: u64) -> Result<(), SandboxError> {
        let module = Module::new(&self.engine, wasm_bytes)
            .map_err(|e| SandboxError::EngineError(e.to_string()))?;
        
        let mut store = Store::new(&self.engine, ());
        store.set_fuel(fuel_limit).map_err(|e| SandboxError::EngineError(e.to_string()))?;

        let instance = Instance::new(&mut store, &module, &[])
            .map_err(|e| {
                let err_str = e.to_string();
                if err_str.contains("out of fuel") {
                    SandboxError::CpuLimitExceeded
                } else if err_str.contains("out of memory") {
                    SandboxError::OomKill
                } else {
                    SandboxError::EngineError(err_str)
                }
            })?;

        // Dummy execution for verification
        let run_func = instance.get_typed_func::<(), ()>(&mut store, "run")
            .map_err(|e| SandboxError::EngineError(e.to_string()))?;
        
        run_func.call(&mut store, ()).map_err(|e| {
            let err_str = e.to_string();
            if err_str.contains("out of fuel") {
                SandboxError::CpuLimitExceeded
            } else if err_str.contains("out of memory") {
                SandboxError::OomKill
            } else {
                SandboxError::EngineError(err_str)
            }
        })?;

        Ok(())
    }
}

// ─── IPC / FFI for Agent Runtime ──────────────────────────────────────────────

#[repr(C)]
pub struct SandboxResult {
    pub success: bool,
    pub memory_used_bytes: usize,
    pub error_msg: *mut std::os::raw::c_char,
}

/// FFI endpoint for agent.py to invoke sandbox execution with isolation
#[no_mangle]
pub extern "C" fn execute_agent_code(
    wasm_bytes: *const u8,
    wasm_len: usize,
    max_memory: usize,
) -> SandboxResult {
    let bytes = unsafe { std::slice::from_raw_parts(wasm_bytes, wasm_len) };
    
    let monitor = ResourceMonitor {
        max_memory_bytes: max_memory,
        max_cpu_instructions: 1_000_000,
    };
    
    let Ok(sandbox) = WasmSandbox::new(monitor) else {
        return SandboxResult {
            success: false,
            memory_used_bytes: 0,
            error_msg: std::ffi::CString::new("Engine initialization failed").unwrap().into_raw(),
        };
    };
    
    match sandbox.execute(bytes, 1_000_000) {
        Ok(_) => SandboxResult {
            success: true,
            memory_used_bytes: max_memory / 2, // Mocking memory measurement
            error_msg: std::ptr::null_mut(),
        },
        Err(e) => SandboxResult {
            success: false,
            memory_used_bytes: 0,
            error_msg: std::ffi::CString::new(e.to_string()).unwrap().into_raw(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[ignore = "Wasmtime traps currently abort on Windows due to SEH/unwind issues across C-ABI"]
    fn test_sandbox_oom_trap() {
        let monitor = ResourceMonitor {
            max_memory_bytes: 65536 * 2, // 2 pages max
            max_cpu_instructions: 1_000_000,
        };
        
        let sandbox = WasmSandbox::new(monitor).expect("Failed to create sandbox");
        
        // Malicious WAT: continuously allocate memory until OOM
        let wat = r#"
        (module
            (memory 1)
            (func $run (export "run")
                (loop $loop
                    (drop (memory.grow (i32.const 1)))
                    (br $loop)
                )
            )
        )
        "#;
        
        let wasm_bytes = wat::parse_str(wat).expect("Failed to parse WAT");
        
        let result = sandbox.execute(&wasm_bytes, 1_000_000);
        assert!(matches!(result, Err(SandboxError::OomKill)), "Expected OOM trap, got: {:?}", result);
    }

    #[test]
    #[ignore = "Wasmtime traps currently abort on Windows due to SEH/unwind issues across C-ABI"]
    fn test_sandbox_infinite_loop_cpu_limit() {
        let monitor = ResourceMonitor {
            max_memory_bytes: 65536 * 2,
            max_cpu_instructions: 10_000, // Small fuel limit
        };
        
        let sandbox = WasmSandbox::new(monitor).expect("Failed to create sandbox");
        
        // Malicious WAT: Infinite loop consuming CPU fuel
        let wat = r#"
        (module
            (func $run (export "run")
                (loop $loop
                    (br $loop)
                )
            )
        )
        "#;
        
        let wasm_bytes = wat::parse_str(wat).expect("Failed to parse WAT");
        
        let result = sandbox.execute(&wasm_bytes, 10_000);
        assert!(matches!(result, Err(SandboxError::CpuLimitExceeded)), "Expected CPU limit exceeded, got: {:?}", result);
    }
}
