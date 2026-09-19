"""
平滑處理模組，提供多種訊號平滑演算法。
"""
import time
import logging
from typing import Any
import numpy as np
from numpy.typing import NDArray
import scipy.signal
import scipy.ndimage
import scipy.sparse
from scipy.sparse.linalg import spsolve

from labflow.core.types import ComputeResult, ConvergenceInfo
from labflow.core.errors import ComputeError

logger = logging.getLogger(__name__)

def savitzky_golay(data: NDArray[np.float64], window_length: int = 11, polyorder: int = 3, deriv: int = 0) -> ComputeResult:
    """
    使用 Savitzky-Golay 濾波器對數據進行平滑處理。

    Args:
        data: 輸入資料陣列。
        window_length: 濾波器窗口長度，必須為正奇數。
        polyorder: 多項式擬合階數，必須小於 window_length。
        deriv: 要計算的導數階數，預設為 0（僅平滑）。

    Returns:
        ComputeResult: 包含平滑後資料及執行時間。
        
    Raises:
        ComputeError: 參數驗證失敗時拋出。
    """
    start_time = time.perf_counter_ns()
    arr = np.array(data, copy=True, dtype=np.float64)
    
    if window_length <= 0 or window_length % 2 == 0:
        raise ComputeError("window_length 必須為正奇數。")
    if polyorder >= window_length:
        raise ComputeError("polyorder 必須小於 window_length。")
        
    try:
        smoothed = scipy.signal.savgol_filter(arr, window_length, polyorder, deriv=deriv)
    except Exception as e:
        raise ComputeError(f"Savitzky-Golay 運算失敗: {e}")
        
    end_time = time.perf_counter_ns()
    exec_ms = (end_time - start_time) / 1_000_000.0
    
    return ComputeResult(
        data=smoothed,
        parameters_used={'window_length': window_length, 'polyorder': polyorder, 'deriv': deriv},
        execution_time_ms=exec_ms,
        metadata={}
    )

def moving_average(data: NDArray[np.float64], window_size: int = 5) -> ComputeResult:
    """
    使用移動平均對數據進行平滑處理。

    Args:
        data: 輸入資料陣列。
        window_size: 窗口大小，必須為正整數。

    Returns:
        ComputeResult: 包含平滑後資料及執行時間。
        
    Raises:
        ComputeError: 參數驗證失敗時拋出。
    """
    start_time = time.perf_counter_ns()
    arr = np.array(data, copy=True, dtype=np.float64)
    
    if window_size <= 0:
        raise ComputeError("window_size 必須為正整數。")
        
    try:
        window = np.ones(int(window_size)) / float(window_size)
        smoothed = np.convolve(arr, window, mode='same')
    except Exception as e:
        raise ComputeError(f"移動平均運算失敗: {e}")
        
    end_time = time.perf_counter_ns()
    exec_ms = (end_time - start_time) / 1_000_000.0
    
    return ComputeResult(
        data=smoothed,
        parameters_used={'window_size': window_size},
        execution_time_ms=exec_ms,
        metadata={}
    )

def gaussian_smooth(data: NDArray[np.float64], sigma: float = 2.0) -> ComputeResult:
    """
    使用高斯濾波器對數據進行平滑處理。

    Args:
        data: 輸入資料陣列。
        sigma: 高斯核的標準差，必須大於 0。

    Returns:
        ComputeResult: 包含平滑後資料及執行時間。
        
    Raises:
        ComputeError: 參數驗證失敗時拋出。
    """
    start_time = time.perf_counter_ns()
    arr = np.array(data, copy=True, dtype=np.float64)
    
    if sigma <= 0.0:
        raise ComputeError("sigma 必須大於 0。")
        
    try:
        smoothed = scipy.ndimage.gaussian_filter1d(arr, sigma)
    except Exception as e:
        raise ComputeError(f"高斯平滑運算失敗: {e}")
        
    end_time = time.perf_counter_ns()
    exec_ms = (end_time - start_time) / 1_000_000.0
    
    return ComputeResult(
        data=smoothed,
        parameters_used={'sigma': sigma},
        execution_time_ms=exec_ms,
        metadata={}
    )

def whittaker_smooth(data: NDArray[np.float64], lam: float = 1e5, d: int = 2) -> ComputeResult:
    """
    使用 Whittaker 平滑器對數據進行平滑處理（適用於光譜基線估計）。

    Args:
        data: 輸入資料陣列。
        lam: 平滑參數（lambda），必須大於 0。
        d: 差分階數，預設為 2。

    Returns:
        ComputeResult: 包含平滑後資料及執行時間。
        
    Raises:
        ComputeError: 參數驗證失敗時拋出。
    """
    start_time = time.perf_counter_ns()
    arr = np.array(data, copy=True, dtype=np.float64)
    
    if lam <= 0.0:
        raise ComputeError("lam 必須大於 0。")
    if d <= 0:
        raise ComputeError("d 必須為正整數。")
        
    try:
        L = len(arr)
        E = scipy.sparse.eye(L, format='csc')
        D = E
        for _ in range(d):
            D = D[1:, :] - D[:-1, :]
        coef_mat = E + lam * (D.T @ D)
        smoothed = spsolve(coef_mat, arr)
    except Exception as e:
        raise ComputeError(f"Whittaker平滑運算失敗: {e}")
        
    end_time = time.perf_counter_ns()
    exec_ms = (end_time - start_time) / 1_000_000.0
    
    return ComputeResult(
        data=smoothed,
        parameters_used={'lam': lam, 'd': d},
        execution_time_ms=exec_ms,
        metadata={}
    )
