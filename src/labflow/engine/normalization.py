"""
正規化引擎模組 (Normalization Engine Module)
提供多種資料縮放與正規化方法。
"""
import time
import numpy as np
from typing import Optional, Tuple, Any
from labflow.core.types import ComputeResult
from labflow.core.errors import ComputeError

def min_max_normalize(data: np.ndarray, feature_range: Tuple[float, float] = (0.0, 1.0)) -> ComputeResult:
    """最大最小正規化至指定區間。"""
    start_time = time.perf_counter_ns()
    try:
        d_min = np.min(data)
        d_max = np.max(data)
        if d_max == d_min:
            raise ComputeError("最大值與最小值相同，無法正規化。")
            
        f_min, f_max = feature_range
        norm_data = (data - d_min) / (d_max - d_min) * (f_max - f_min) + f_min
        
        exec_time = (time.perf_counter_ns() - start_time) / 1e6
        return ComputeResult(
            data=norm_data,
            metadata={"method": "min_max", "range": feature_range},
            execution_time_ms=exec_time
        )
    except Exception as e:
        if isinstance(e, ComputeError):
            raise
        raise ComputeError(f"最大最小正規化失敗: {str(e)}")

def z_score_normalize(data: np.ndarray) -> ComputeResult:
    """Z-score 正規化 (標準化)。"""
    start_time = time.perf_counter_ns()
    try:
        mean_val = np.mean(data)
        std_val = np.std(data, ddof=1)
        if std_val == 0:
            raise ComputeError("標準差為零，無法進行 Z-score 正規化。")
            
        norm_data = (data - mean_val) / std_val
        exec_time = (time.perf_counter_ns() - start_time) / 1e6
        return ComputeResult(
            data=norm_data,
            metadata={"method": "z_score", "mean": float(mean_val), "std": float(std_val)},
            execution_time_ms=exec_time
        )
    except Exception as e:
        if isinstance(e, ComputeError):
            raise
        raise ComputeError(f"Z-score 正規化失敗: {str(e)}")

def area_normalize(data: np.ndarray, x: Optional[np.ndarray] = None) -> ComputeResult:
    """面積正規化 (使曲線下面積為 1)。"""
    start_time = time.perf_counter_ns()
    try:
        if x is None:
            area = np.trapezoid(data)
        else:
            area = np.trapezoid(data, x)
            
        if area == 0:
            raise ComputeError("面積為零，無法正規化。")
            
        norm_data = data / area
        exec_time = (time.perf_counter_ns() - start_time) / 1e6
        return ComputeResult(
            data=norm_data,
            metadata={"method": "area", "area": float(area)},
            execution_time_ms=exec_time
        )
    except Exception as e:
        if isinstance(e, ComputeError):
            raise
        raise ComputeError(f"面積正規化失敗: {str(e)}")

def max_normalize(data: np.ndarray) -> ComputeResult:
    """最大值正規化 (除以最大值)。"""
    start_time = time.perf_counter_ns()
    try:
        max_val = np.max(data)
        if max_val == 0:
            raise ComputeError("最大值為零，無法正規化。")
            
        norm_data = data / max_val
        exec_time = (time.perf_counter_ns() - start_time) / 1e6
        return ComputeResult(
            data=norm_data,
            metadata={"method": "max", "max_val": float(max_val)},
            execution_time_ms=exec_time
        )
    except Exception as e:
        if isinstance(e, ComputeError):
            raise
        raise ComputeError(f"最大值正規化失敗: {str(e)}")
