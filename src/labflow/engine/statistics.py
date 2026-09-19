"""
統計分析引擎模組 (Statistics Engine Module)
提供描述性統計與線性迴歸等功能。
"""
import time
import numpy as np
from scipy import stats
from typing import Optional, Any
from labflow.core.types import ComputeResult
from labflow.core.errors import ComputeError

def descriptive_stats(data: np.ndarray) -> ComputeResult:
    """計算描述性統計特徵。"""
    start_time = time.perf_counter_ns()
    
    try:
        data_clean = data[~np.isnan(data)]
        if data_clean.size == 0:
            raise ComputeError("輸入資料為空或全為 NaN。")
            
        mean_val = float(np.mean(data_clean))
        std_val = float(np.std(data_clean, ddof=1))
        median_val = float(np.median(data_clean))
        min_val = float(np.min(data_clean))
        max_val = float(np.max(data_clean))
        skewness_val = float(stats.skew(data_clean))
        kurtosis_val = float(stats.kurtosis(data_clean))
        count_val = int(data_clean.size)
        sum_val = float(np.sum(data_clean))
        
        metadata = {
            "mean": mean_val,
            "std": std_val,
            "median": median_val,
            "min": min_val,
            "max": max_val,
            "skewness": skewness_val,
            "kurtosis": kurtosis_val,
            "count": count_val,
            "sum": sum_val
        }
        
        exec_time = (time.perf_counter_ns() - start_time) / 1e6
        return ComputeResult(
            data=np.copy(data),
            metadata=metadata,
            execution_time_ms=exec_time
        )
    except Exception as e:
        if isinstance(e, ComputeError):
            raise
        raise ComputeError(f"統計分析失敗: {str(e)}")

def linear_regression(y: np.ndarray, x: Optional[np.ndarray] = None) -> ComputeResult:
    """計算線性迴歸。"""
    start_time = time.perf_counter_ns()
    try:
        if x is None:
            x = np.arange(len(y))
            
        mask = ~(np.isnan(x) | np.isnan(y))
        x_clean = x[mask]
        y_clean = y[mask]
        
        if len(x_clean) < 2:
            raise ComputeError("有效資料點不足。")
            
        slope, intercept, r_value, p_value, std_err = stats.linregress(x_clean, y_clean)
        
        fitted_line = slope * x + intercept
        
        metadata = {
            "slope": slope,
            "intercept": intercept,
            "r_squared": r_value ** 2,
            "std_err": std_err,
            "p_value": p_value
        }
        
        exec_time = (time.perf_counter_ns() - start_time) / 1e6
        return ComputeResult(
            data=fitted_line,
            metadata=metadata,
            execution_time_ms=exec_time
        )
    except Exception as e:
        if isinstance(e, ComputeError):
            raise
        raise ComputeError(f"線性迴歸失敗: {str(e)}")
