"""
光譜尋峰與配適引擎模組。

提供峰形生成、自動尋峰與多重峰配適演算法。
所有功能函式均為純函式。
"""

import time
import logging
from typing import Optional, List, Dict, Any, Union, Tuple
import numpy as np
from scipy import signal, optimize

from labflow.core.types import ComputeResult, ConvergenceInfo
from labflow.core.errors import ComputeError

logger = logging.getLogger(__name__)

def gaussian(x: np.ndarray, amplitude: float, center: float, sigma: float) -> np.ndarray:
    """高斯峰形函式。"""
    return amplitude * np.exp(-0.5 * ((x - center) / sigma) ** 2)

def lorentzian(x: np.ndarray, amplitude: float, center: float, gamma: float) -> np.ndarray:
    """勞侖茲峰形函式。"""
    return amplitude * gamma**2 / ((x - center)**2 + gamma**2)

def pseudo_voigt(x: np.ndarray, amplitude: float, center: float, 
                 sigma: float, fraction: float) -> np.ndarray:
    """擬乏特峰形函式 (高斯與勞侖茲的線性組合)。"""
    # fraction: 0 = pure Gaussian, 1 = pure Lorentzian
    g = gaussian(x, amplitude, center, sigma)
    l = lorentzian(x, amplitude, center, sigma)  # 使用相同的寬度參數
    return (1 - fraction) * g + fraction * l

def detect_peaks(
    data: np.ndarray,
    x: Optional[np.ndarray] = None,
    height: Optional[Union[float, Tuple[float, float]]] = None,
    distance: Optional[int] = None,
    prominence: Optional[Union[float, Tuple[float, float]]] = None
) -> ComputeResult:
    """
    尋找資料中的峰值。

    Args:
        data: 一維資料陣列。
        x: 一維 X 軸資料陣列 (可選)。
        height: 峰值高度閾值。
        distance: 峰與峰之間的最小距離。
        prominence: 峰的顯著度。

    Returns:
        ComputeResult 包含峰值索引與元資料。
    """
    start_time = time.perf_counter_ns()
    
    try:
        data = np.asarray(data)
        if x is not None:
            x = np.asarray(x)
            
        peaks, properties = signal.find_peaks(
            data, height=height, distance=distance, prominence=prominence
        )
        
        metadata: Dict[str, Any] = {'peak_heights': None, 'peak_positions': None, 'prominences': None}
        
        if 'peak_heights' in properties:
            metadata['peak_heights'] = properties['peak_heights']
        else:
            metadata['peak_heights'] = data[peaks]
            
        if x is not None:
            metadata['peak_positions'] = x[peaks]
        else:
            metadata['peak_positions'] = peaks
            
        if 'prominences' in properties:
            metadata['prominences'] = properties['prominences']
            
        exec_time_ms = (time.perf_counter_ns() - start_time) / 1e6
        return ComputeResult(
            data=peaks,
            execution_time_ms=exec_time_ms,
            metadata=metadata,
            parameters_used={'height': height, 'distance': distance, 'prominence': prominence}
        )
    except Exception as e:
        logger.error(f"尋峰失敗: {str(e)}")
        raise ComputeError(f"尋峰失敗: {str(e)}") from e


def _get_profile_func(profile: str):
    if profile == 'gaussian':
        return gaussian
    elif profile == 'lorentzian':
        return lorentzian
    elif profile == 'pseudo_voigt':
        return pseudo_voigt
    else:
        raise ValueError(f"未知的峰形: {profile}")


def fit_single_peak(
    data: np.ndarray,
    x: np.ndarray,
    profile: str = 'gaussian',
    initial_guess: Optional[List[float]] = None,
    bounds: Optional[Tuple[List[float], List[float]]] = None
) -> ComputeResult:
    """
    配適單一峰形。

    Args:
        data: Y 軸資料。
        x: X 軸資料。
        profile: 峰形名稱 ('gaussian', 'lorentzian', 'pseudo_voigt')。
        initial_guess: 初始猜測參數列表。
        bounds: 參數邊界 (下界列表, 上界列表)。

    Returns:
        ComputeResult 包含配適結果。
    """
    start_time = time.perf_counter_ns()
    
    try:
        data = np.asarray(data)
        x = np.asarray(x)
        
        func = _get_profile_func(profile)
        
        if initial_guess is None:
            amp = np.max(data)
            cen = x[np.argmax(data)]
            # 粗略估算半高寬
            half_max = amp / 2
            indices = np.where(data >= half_max)[0]
            if len(indices) > 1:
                fwhm = x[indices[-1]] - x[indices[0]]
            else:
                fwhm = (np.max(x) - np.min(x)) / 10
            sig = fwhm / 2.355
            
            if profile == 'pseudo_voigt':
                initial_guess = [amp, cen, sig, 0.5]
            else:
                initial_guess = [amp, cen, sig]
                
        if bounds is None:
            bounds = (-np.inf, np.inf)
            
        popt, pcov = optimize.curve_fit(func, x, data, p0=initial_guess, bounds=bounds)
        
        fitted_data = func(x, *popt)
        residuals = data - fitted_data
        
        # 計算 R-squared
        ss_res = np.sum(residuals**2)
        ss_tot = np.sum((data - np.mean(data))**2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
        
        fwhm_val = popt[2] * 2.355 # 簡單計算 FWHM
        
        params_used = {'amplitude': popt[0], 'center': popt[1], 'sigma_gamma': popt[2]}
        if profile == 'pseudo_voigt':
            params_used['fraction'] = popt[3]
            
        exec_time_ms = (time.perf_counter_ns() - start_time) / 1e6
        
        # curve_fit 收斂資訊
        conv_info = ConvergenceInfo(converged=True, iterations=1, residual_norm=0.0)
        
        return ComputeResult(
            data=fitted_data,
            execution_time_ms=exec_time_ms,
            metadata={'r_squared': r_squared, 'fwhm': fwhm_val, 'profile_type': profile},
            parameters_used=params_used,
            convergence=conv_info,
            residuals=residuals,
            covariance=pcov
        )
    except Exception as e:
        logger.error(f"單峰配適失敗: {str(e)}")
        raise ComputeError(f"單峰配適失敗: {str(e)}") from e


def fit_multi_peak(
    data: np.ndarray,
    x: np.ndarray,
    n_peaks: int,
    profile: str = 'gaussian',
    initial_guesses: Optional[List[List[float]]] = None,
    bounds: Optional[Tuple[List[float], List[float]]] = None
) -> ComputeResult:
    """
    配適多重峰形。

    Args:
        data: Y 軸資料。
        x: X 軸資料。
        n_peaks: 欲配適的峰數。
        profile: 峰形名稱 ('gaussian', 'lorentzian', 'pseudo_voigt')。
        initial_guesses: 各峰的初始猜測參數列表的列表。
        bounds: 所有參數的邊界。

    Returns:
        ComputeResult 包含多峰配適結果。
    """
    start_time = time.perf_counter_ns()
    
    try:
        data = np.asarray(data)
        x = np.asarray(x)
        
        base_func = _get_profile_func(profile)
        num_params = 4 if profile == 'pseudo_voigt' else 3
        
        def composite_model(x_data, *params):
            result = np.zeros_like(x_data)
            for i in range(n_peaks):
                p = params[i*num_params : (i+1)*num_params]
                result += base_func(x_data, *p)
            return result
            
        if initial_guesses is None:
            # 自動偵測峰值作為初始猜測
            detect_res = detect_peaks(data, x=x)
            peak_indices = detect_res.data
            
            p0 = []
            fwhm_guess = (np.max(x) - np.min(x)) / (n_peaks * 5)
            
            # 若偵測到的峰數量不足，以均勻分佈填充
            for i in range(n_peaks):
                if i < len(peak_indices):
                    idx = peak_indices[i]
                    amp = data[idx]
                    cen = x[idx]
                else:
                    amp = np.max(data) / 2
                    cen = x[len(x) // (n_peaks + 1) * (i + 1)]
                
                if profile == 'pseudo_voigt':
                    p0.extend([amp, cen, fwhm_guess/2.355, 0.5])
                else:
                    p0.extend([amp, cen, fwhm_guess/2.355])
        else:
            p0 = [p for guess in initial_guesses for p in guess]
            
        if bounds is None:
            bounds = (-np.inf, np.inf)
            
        popt, pcov = optimize.curve_fit(composite_model, x, data, p0=p0, bounds=bounds)
        
        fitted_data = composite_model(x, *popt)
        residuals = data - fitted_data
        
        ss_res = np.sum(residuals**2)
        ss_tot = np.sum((data - np.mean(data))**2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
        
        params_used = {}
        individual_peaks = []
        for i in range(n_peaks):
            p = popt[i*num_params : (i+1)*num_params]
            peak_curve = base_func(x, *p)
            individual_peaks.append(peak_curve)
            
            peak_params = {'amplitude': p[0], 'center': p[1], 'sigma_gamma': p[2]}
            if profile == 'pseudo_voigt':
                peak_params['fraction'] = p[3]
            params_used[f'peak_{i}'] = peak_params
            
        exec_time_ms = (time.perf_counter_ns() - start_time) / 1e6
        conv_info = ConvergenceInfo(converged=True, iterations=1, residual_norm=0.0)
        
        return ComputeResult(
            data=fitted_data,
            execution_time_ms=exec_time_ms,
            metadata={'r_squared': r_squared, 'individual_peaks': individual_peaks},
            parameters_used=params_used,
            convergence=conv_info,
            residuals=residuals,
            covariance=pcov
        )
    except Exception as e:
        logger.error(f"多峰配適失敗: {str(e)}")
        raise ComputeError(f"多峰配適失敗: {str(e)}") from e
