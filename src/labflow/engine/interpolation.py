"""
內插引擎模組 (Interpolation Engine Module)
提供線性、三次樣條與 Akima 內插演算法。
"""
import time
import numpy as np
from scipy import interpolate
from typing import Any
from labflow.core.types import ComputeResult
from labflow.core.errors import ComputeError

def linear_interpolation(data: np.ndarray, x: np.ndarray, x_new: np.ndarray) -> ComputeResult:
    """線性內插。"""
    start_time = time.perf_counter_ns()
    try:
        y_new = np.interp(x_new, x, data)
        exec_time = (time.perf_counter_ns() - start_time) / 1e6
        return ComputeResult(
            data=y_new,
            metadata={"method": "linear"},
            execution_time_ms=exec_time
        )
    except Exception as e:
        raise ComputeError(f"線性內插失敗: {str(e)}")

def cubic_spline(data: np.ndarray, x: np.ndarray, x_new: np.ndarray, bc_type: str = 'natural') -> ComputeResult:
    """三次樣條內插。"""
    start_time = time.perf_counter_ns()
    try:
        cs = interpolate.CubicSpline(x, data, bc_type=bc_type)
        y_new = cs(x_new)
        exec_time = (time.perf_counter_ns() - start_time) / 1e6
        return ComputeResult(
            data=y_new,
            metadata={"method": "cubic_spline", "bc_type": bc_type},
            execution_time_ms=exec_time
        )
    except Exception as e:
        raise ComputeError(f"三次樣條內插失敗: {str(e)}")

def akima_interpolation(data: np.ndarray, x: np.ndarray, x_new: np.ndarray) -> ComputeResult:
    """Akima 內插。"""
    start_time = time.perf_counter_ns()
    try:
        akima = interpolate.Akima1DInterpolator(x, data)
        y_new = akima(x_new)
        exec_time = (time.perf_counter_ns() - start_time) / 1e6
        return ComputeResult(
            data=y_new,
            metadata={"method": "akima"},
            execution_time_ms=exec_time
        )
    except Exception as e:
        raise ComputeError(f"Akima 內插失敗: {str(e)}")
