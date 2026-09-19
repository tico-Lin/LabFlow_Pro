"""
曲線擬合引擎模組 (Curve Fitting Engine Module)
提供多項式擬合與非線性模型擬合。
"""
import time
import numpy as np
from scipy import optimize
from typing import Callable, Optional, Tuple, Any, List
from labflow.core.types import ComputeResult, ConvergenceInfo
from labflow.core.errors import ComputeError

def nonlinear_fit(
    data: np.ndarray,
    x: np.ndarray,
    model_func: Callable,
    initial_params: List[float],
    bounds: Optional[Tuple[List[float], List[float]]] = None
) -> ComputeResult:
    """非線性最小平方法曲線擬合。"""
    start_time = time.perf_counter_ns()
    try:
        if bounds is None:
            bounds_to_use = (-np.inf, np.inf)
        else:
            bounds_to_use = bounds
            
        popt, pcov = optimize.curve_fit(
            model_func, x, data, p0=initial_params, bounds=bounds_to_use
        )
        
        fitted_curve = model_func(x, *popt)
        residuals = data - fitted_curve
        ss_res = np.sum(residuals**2)
        ss_tot = np.sum((data - np.mean(data))**2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0.0
        
        conv_info = ConvergenceInfo(
            converged=True,
            iterations=0,
            final_error=float(ss_res)
        )
        
        metadata = {
            "parameters": popt.tolist(),
            "covariance": pcov.tolist(),
            "r_squared": float(r_squared),
            "residuals": residuals.tolist(),
            "convergence": conv_info
        }
        
        exec_time = (time.perf_counter_ns() - start_time) / 1e6
        return ComputeResult(
            data=fitted_curve,
            metadata=metadata,
            execution_time_ms=exec_time
        )
    except Exception as e:
        raise ComputeError(f"非線性擬合失敗: {str(e)}")

def polynomial_fit(data: np.ndarray, x: np.ndarray, degree: int = 3) -> ComputeResult:
    """多項式擬合。"""
    start_time = time.perf_counter_ns()
    try:
        coeffs = np.polyfit(x, data, degree)
        fitted_curve = np.polyval(coeffs, x)
        
        metadata = {
            "coefficients": coeffs.tolist(),
            "degree": degree
        }
        
        exec_time = (time.perf_counter_ns() - start_time) / 1e6
        return ComputeResult(
            data=fitted_curve,
            metadata=metadata,
            execution_time_ms=exec_time
        )
    except Exception as e:
        raise ComputeError(f"多項式擬合失敗: {str(e)}")
