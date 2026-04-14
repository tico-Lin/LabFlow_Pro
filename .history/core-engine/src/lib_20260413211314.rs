pub mod sandbox;
pub mod pointer;
pub mod crdt;
pub mod shadow;
pub mod data_ingestion;

use pyo3::exceptions::PyValueError;
use pyo3::prelude::*;
use pyo3::types::PyBytes;

use sandbox::SandboxIo;

// ─── Python class ────────────────────────────────────────────────────────────

/// L1 core engine exposed to Python agents via PyO3 FFI.
///
/// The sandbox owns a fixed-capacity byte buffer whose base address is
/// published to Python via `base_address()`. Agents can then compute
/// absolute pointer values and call `read_pointer` / `write_at` directly,
/// bypassing serialisation entirely.
///
/// ```python
/// core = LabFlowCore(1024)
/// base = core.base_address()
/// core.write_at(base, b"hello")
/// assert core.read_pointer(base, 5) == b"hello"
/// ```
#[pyclass(name = "LabFlowCore")]
pub struct LabFlowCore {
    sandbox: SandboxIo,
}

#[pymethods]
impl LabFlowCore {
    /// Create a new sandbox with `capacity` bytes.
    #[new]
    pub fn new(capacity: usize) -> PyResult<Self> {
        if capacity == 0 {
            return Err(PyValueError::new_err("capacity must be > 0"));
        }
        Ok(Self {
            sandbox: SandboxIo::new(capacity),
        })
    }

    // ── Pointer introspection ────────────────────────────────────────────────

    /// Absolute memory address of the first byte of the sandbox buffer.
    ///
    /// Python agents use this as the anchor for pointer arithmetic:
    ///
    /// ```python
    /// offset = 64
    /// data   = core.read_pointer(core.base_address() + offset, 16)
    /// ```
    pub fn base_address(&self) -> usize {
        self.sandbox.as_ptr() as usize
    }

    /// Total capacity of the sandbox in bytes.
    pub fn capacity(&self) -> usize {
        self.sandbox.capacity()
    }

    /// Current write cursor position.
    pub fn cursor(&self) -> usize {
        self.sandbox.cursor()
    }

    // ── Read via raw pointer ─────────────────────────────────────────────────

    /// Read `size` bytes from absolute pointer `address`.
    ///
    /// Validates that `[address, address + size)` lies entirely within the
    /// sandbox allocation before issuing the raw read, maintaining Rust's
    /// memory-safety contract at the FFI boundary.
    ///
    /// Returns a Python `bytes` object (one copy; for zero-copy, expose via
    /// the buffer protocol with `PyMemoryView` in a future iteration).
    pub fn read_pointer<'py>(
        &self,
        py: Python<'py>,
        address: usize,
        size: usize,
    ) -> PyResult<Bound<'py, PyBytes>> {
        self.validate_range(address, size)?;

        let base   = self.sandbox.as_ptr() as usize;
        let offset = address - base;

        // SAFETY: `validate_range` guarantees [offset, offset+size) ⊆ [0, capacity).
        //   • The buffer is owned by `self` (Vec<u8>) – alive for the duration of this call.
        //   • No other mutable borrow of `self.sandbox` exists (`&self` receiver).
        //   • `u8` has no alignment requirement beyond 1.
        let slice = unsafe {
            std::slice::from_raw_parts(self.sandbox.as_ptr().add(offset), size)
        };

        Ok(PyBytes::new(py, slice))
    }

    // ── Write via raw pointer ─────────────────────────────────────────────────

    /// Write `data` into the sandbox at absolute pointer `address`.
    ///
    /// Mirrors `read_pointer` – validates bounds, then performs a raw write.
    pub fn write_at(&mut self, address: usize, data: &[u8]) -> PyResult<()> {
        self.validate_range(address, data.len())?;

        let base   = self.sandbox.as_ptr() as usize;
        let offset = address - base;

        // SAFETY: `validate_range` guarantees [offset, offset+len) ⊆ [0, capacity).
        //   • `&mut self` ensures exclusive access – no concurrent reads.
        unsafe {
            std::ptr::copy_nonoverlapping(
                data.as_ptr(),
                self.sandbox.as_mut_ptr().add(offset),
                data.len(),
            );
        }
        Ok(())
    }

    // ── High-level helpers (no raw pointer, safe Rust paths) ─────────────────

    /// Zero-fill `[address, address + size)`.
    pub fn zero_region(&mut self, address: usize, size: usize) -> PyResult<()> {
        self.validate_range(address, size)?;
        let base   = self.sandbox.as_ptr() as usize;
        let offset = address - base;
        // SAFETY: same contract as `write_at`.
        unsafe {
            std::ptr::write_bytes(self.sandbox.as_mut_ptr().add(offset), 0, size);
        }
        Ok(())
    }
}

// ─── Private helpers ─────────────────────────────────────────────────────────

impl LabFlowCore {
    /// Assert that `[address, address + size)` is a valid range inside the
    /// sandbox allocation.  Used as a precondition gate before every `unsafe`
    /// block so callers never need to repeat this logic.
    fn validate_range(&self, address: usize, size: usize) -> PyResult<()> {
        let base    = self.sandbox.as_ptr() as usize;
        let buf_end = base + self.sandbox.capacity(); // safe: Vec is bounded

        let end = address
            .checked_add(size)
            .ok_or_else(|| PyValueError::new_err("pointer arithmetic overflow"))?;

        if address < base || end > buf_end {
            return Err(PyValueError::new_err(format!(
                "pointer 0x{address:016x}+{size} out of sandbox \
                 [0x{base:016x}, 0x{buf_end:016x})"
            )));
        }
        Ok(())
    }
}

// ─── Module registration ──────────────────────────────────────────────────────

/// `core_engine` Python extension module.
///
/// Build with:  `maturin develop` (dev) or `maturin build --release` (wheel).
/// Then from Python:
///   ```python
///   from core_engine import LabFlowCore
///   core = LabFlowCore(4096)
///   ```
#[pymodule]
fn core_engine(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_class::<LabFlowCore>()?;
    Ok(())
}
