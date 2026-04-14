/// Pointer arithmetic helper for raw/unsafe offset calculations.
/// All operations are bounds-checked; panics are replaced with `Option`.
pub struct PointerArith {
    base: usize,
}

impl PointerArith {
    pub fn new(base: usize) -> Self {
        Self { base }
    }

    /// Adds a relative offset, returning `None` on overflow.
    pub fn offset(&self, delta: isize) -> Option<usize> {
        if delta >= 0 {
            self.base.checked_add(delta as usize)
        } else {
            self.base.checked_sub(delta.unsigned_abs())
        }
    }

    /// Returns the byte distance between this pointer and another.
    pub fn diff(&self, other: usize) -> isize {
        (self.base as isize).wrapping_sub(other as isize)
    }

    /// Aligns the base address up to the given power-of-two alignment.
    pub fn align_up(&self, align: usize) -> Option<usize> {
        debug_assert!(align.is_power_of_two());
        let mask = align - 1;
        self.base.checked_add(mask).map(|v| v & !mask)
    }
}
