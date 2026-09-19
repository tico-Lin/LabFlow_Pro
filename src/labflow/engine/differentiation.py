"""
數值微分模組，提供多種微分計算方法。
"""
import time
import logging
from typing import Optional
import numpy as np
from numpy.typing import NDArray
import scipy.signal

from labflow.core.types import ComputeResult
from labflow.core.errors import ComputeError

logger = logging.getLogger(__name__)

def numerical_derivative(data: NDArray[np.float64], x: Optional[NDArray[np.float64]] = None, order: int = 1, method: str = 'central') -> ComputeResult:
    """
    計算數據的數值導數。

    Args:
        data: 輸入資料陣列。
        x: 對應的 x 座標陣列。若為 None，假設等距 dx=1。
        order: 微分階數。
        method: 微分方法，可為 'central', 'forward' 或 'backward'。

    Returns:
        ComputeResult: 包含微分後資料及執行時間。
        
    Raises:
        ComputeError: 參數驗證失敗時拋出。
    """
    start_time = time.perf_counter_ns()
    y = np.array(data, copy=True, dtype=np.float64)
    if x is not None:
        x_arr = np.array(x, copy=True, dtype=np.float64)
        if len(x_arr) != len(y):
            raise ComputeError("x 與 data 的長度必須相同。")
            
    if order <= 0:
        raise ComputeError("order 必須為正整數。")
    if method not in ('central', 'forward', 'backward'):
        raise ComputeError("method 必須為 'central', 'forward' 或 'backward'。")
        
    try:
        result = y
        for _ in range(order):
            if method == 'central':
                if x is not None:
                    result = np.gradient(result, x_arr)
                else:
                    result = np.gradient(result)
            elif method == 'forward':
                dy = np.diff(result)
                if x is not None:
                    dx = np.diff(x_arr)
                    result = np.append(dy / dx, np.nan)
                else:
                    result = np.append(dy, np.nan)
            elif method == 'backward':
                dy = np.diff(result)
                if x is not None:
                    dx = np.diff(x_arr)
                    result = np.insert(dy / dx, 0, np.nan)
                else:
                    result = np.insert(dy, 0, np.nan)
    except Exception as e:
        raise ComputeError(f"數值微分運算失敗: {e}")
        
    end_time = time.perf_counter_ns()
    return ComputeResult(
        data=result,
        parameters_used={'order': order, 'method': method, 'has_x': x is not None},
        execution_time_ms=(end_time - start_time) / 1_000_000.0,
        metadata={}
    )

def savitzky_golay_derivative(data: NDArray[np.float64], x: Optional[NDArray[np.float64]] = None, window_length: int = 11, polyorder: int = 3, deriv: int = 1) -> ComputeResult:
    """
    使用 Savitzky-Golay 濾波器計算數據的平滑導數，適合處理含噪訊數據。

    Args:
        data: 輸入資料陣列。
        x: 對應的 x 座標陣列。若為 None，假設等距 dx=1。
        window_length: 濾波器窗口長度，必須為正奇數。
        polyorder: 多項式擬合階數，必須小於 window_length。
        deriv: 要計算的導數階數，預設為 1。

    Returns:
        ComputeResult: 包含微分後資料及執行時間。
        
    Raises:
        ComputeError: 參數驗證失敗時拋出。
    """
    start_time = time.perf_counter_ns()
    y = np.array(data, copy=True, dtype=np.float64)
    
    if window_length <= 0 or window_length % 2 == 0:
        raise ComputeError("window_length 必須為正奇數。")
    if polyorder >= window_length:
        raise ComputeError("polyorder 必須小於 window_length。")
    if deriv <= 0:
        raise ComputeError("deriv 必須為正整數。")
        
    try:
        if x is not None:
            x_arr = np.array(x, dtype=np.float64)
            if len(x_arr) != len(y):
                raise ComputeError("x 與 data 的長度必須相同。")
            dx = np.mean(np.diff(x_arr))
            result = scipy.signal.savgol_filter(y, window_length, polyorder, deriv=deriv, delta=dx)
        else:
            result = scipy.signal.savgol_filter(y, window_length, polyorder, deriv=deriv)
    except Exception as e:
        raise ComputeError(f"Savitzky-Golay 微分運算失敗: {e}")
        
    end_time = time.perf_counter_ns()
    return ComputeResult(
        data=result,
        parameters_used={'window_length': window_length, 'polyorder': polyorder, 'deriv': deriv, 'has_x': x is not None},
        execution_time_ms=(end_time - start_time) / 1_000_000.0,
        metadata={}
    )
