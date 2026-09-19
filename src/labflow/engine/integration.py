"""
數值積分模組，提供多種積分計算方法。
"""
import time
import logging
from typing import Optional
import numpy as np
from numpy.typing import NDArray
import scipy.integrate

from labflow.core.types import ComputeResult
from labflow.core.errors import ComputeError

logger = logging.getLogger(__name__)

def trapezoidal(data: NDArray[np.float64], x: Optional[NDArray[np.float64]] = None) -> ComputeResult:
    """
    使用梯形法則計算數據的定積分。

    Args:
        data: 輸入資料陣列。
        x: 對應的 x 座標陣列。若為 None，預設間距為 1。

    Returns:
        ComputeResult: 包含積分結果(單一元素陣列)及執行時間。
        
    Raises:
        ComputeError: 參數驗證失敗時拋出。
    """
    start_time = time.perf_counter_ns()
    y = np.array(data, copy=True, dtype=np.float64)
    try:
        if x is not None:
            x_arr = np.array(x, dtype=np.float64)
            val = scipy.integrate.trapezoid(y, x=x_arr)
        else:
            val = scipy.integrate.trapezoid(y)
        result = np.array([val], dtype=np.float64)
    except Exception as e:
        raise ComputeError(f"梯形積分運算失敗: {e}")
        
    end_time = time.perf_counter_ns()
    return ComputeResult(
        data=result,
        parameters_used={'method': 'trapezoidal', 'has_x': x is not None},
        execution_time_ms=(end_time - start_time) / 1_000_000.0,
        metadata={}
    )

def simpson(data: NDArray[np.float64], x: Optional[NDArray[np.float64]] = None) -> ComputeResult:
    """
    使用辛普森法則計算數據的定積分。

    Args:
        data: 輸入資料陣列。
        x: 對應的 x 座標陣列。若為 None，預設間距為 1。

    Returns:
        ComputeResult: 包含積分結果(單一元素陣列)及執行時間。
        
    Raises:
        ComputeError: 參數驗證失敗時拋出。
    """
    start_time = time.perf_counter_ns()
    y = np.array(data, copy=True, dtype=np.float64)
    
    if len(y) % 2 != 0:
        raise ComputeError("Simpson積分需要偶數個資料點 (奇數個區間)。")
        
    try:
        if x is not None:
            x_arr = np.array(x, dtype=np.float64)
            val = scipy.integrate.simpson(y, x=x_arr)
        else:
            val = scipy.integrate.simpson(y)
        result = np.array([val], dtype=np.float64)
    except Exception as e:
        raise ComputeError(f"Simpson積分運算失敗: {e}")
        
    end_time = time.perf_counter_ns()
    return ComputeResult(
        data=result,
        parameters_used={'method': 'simpson', 'has_x': x is not None},
        execution_time_ms=(end_time - start_time) / 1_000_000.0,
        metadata={}
    )

def cumulative_integral(data: NDArray[np.float64], x: Optional[NDArray[np.float64]] = None, initial: float = 0.0) -> ComputeResult:
    """
    計算數據的累積積分。

    Args:
        data: 輸入資料陣列。
        x: 對應的 x 座標陣列。若為 None，預設間距為 1。
        initial: 積分起始值，預設為 0.0。

    Returns:
        ComputeResult: 包含累積積分陣列及執行時間。
        
    Raises:
        ComputeError: 參數驗證失敗時拋出。
    """
    start_time = time.perf_counter_ns()
    y = np.array(data, copy=True, dtype=np.float64)
    try:
        if x is not None:
            x_arr = np.array(x, dtype=np.float64)
            result = scipy.integrate.cumulative_trapezoid(y, x=x_arr, initial=initial)
        else:
            result = scipy.integrate.cumulative_trapezoid(y, initial=initial)
    except Exception as e:
        raise ComputeError(f"累積積分運算失敗: {e}")
        
    end_time = time.perf_counter_ns()
    return ComputeResult(
        data=result,
        parameters_used={'initial': initial, 'has_x': x is not None},
        execution_time_ms=(end_time - start_time) / 1_000_000.0,
        metadata={}
    )
