use anyhow::Result;
use thiserror::Error;

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
}
