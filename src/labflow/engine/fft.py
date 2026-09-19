"""
快速傅立葉變換模組，提供頻域分析與濾波功能。
"""
import time
import logging
from typing import Optional
import numpy as np
from numpy.typing import NDArray
import scipy.signal
import scipy.fft

from labflow.core.types import ComputeResult
from labflow.core.errors import ComputeError

logger = logging.getLogger(__name__)

def fft_forward(data: NDArray[np.float64], sample_rate: float = 1.0) -> ComputeResult:
    """
    對數據進行實數快速傅立葉變換 (RFFT)，取得頻譜振幅。

    Args:
        data: 輸入的實數資料陣列。
        sample_rate: 採樣頻率，必須大於 0。

    Returns:
        ComputeResult: 包含頻譜振幅及頻率軸(metadata)及執行時間。
        
    Raises:
        ComputeError: 參數驗證失敗時拋出。
    """
    start_time = time.perf_counter_ns()
    y = np.array(data, copy=True, dtype=np.float64)
    if sample_rate <= 0:
        raise ComputeError("sample_rate 必須大於 0。")
        
    try:
        spectrum = np.fft.rfft(y)
        magnitude = np.abs(spectrum)
        freqs = np.fft.rfftfreq(len(y), d=1.0/sample_rate)
    except Exception as e:
        raise ComputeError(f"正向 FFT 運算失敗: {e}")
        
    end_time = time.perf_counter_ns()
    return ComputeResult(
        data=magnitude,
        parameters_used={'sample_rate': sample_rate},
        execution_time_ms=(end_time - start_time) / 1_000_000.0,
        metadata={'frequencies': freqs.tolist()}
    )

def fft_inverse(spectrum: NDArray[np.complex128], n: Optional[int] = None) -> ComputeResult:
    """
    對頻譜進行逆向實數快速傅立葉變換 (IRFFT)，重建時域訊號。

    Args:
        spectrum: 輸入的頻譜複數陣列。
        n: 重建後的資料長度，若為 None 則自動推斷。

    Returns:
        ComputeResult: 包含重建訊號及執行時間。
        
    Raises:
        ComputeError: 參數驗證失敗時拋出。
    """
    start_time = time.perf_counter_ns()
    spec = np.array(spectrum, copy=True, dtype=np.complex128)
    
    try:
        if n is not None:
            reconstructed = np.fft.irfft(spec, n=n)
        else:
            reconstructed = np.fft.irfft(spec)
    except Exception as e:
        raise ComputeError(f"反向 FFT 運算失敗: {e}")
        
    end_time = time.perf_counter_ns()
    return ComputeResult(
        data=reconstructed,
        parameters_used={'n': n},
        execution_time_ms=(end_time - start_time) / 1_000_000.0,
        metadata={}
    )

def power_spectrum(data: NDArray[np.float64], sample_rate: float = 1.0, window: str = 'hann') -> ComputeResult:
    """
    計算數據的功率譜密度 (PSD)。

    Args:
        data: 輸入資料陣列。
        sample_rate: 採樣頻率，必須大於 0。
        window: 窗口函數名稱，預設為 'hann'。

    Returns:
        ComputeResult: 包含 PSD 結果及頻率軸(metadata)及執行時間。
        
    Raises:
        ComputeError: 參數驗證失敗時拋出。
    """
    start_time = time.perf_counter_ns()
    y = np.array(data, copy=True, dtype=np.float64)
    N = len(y)
    
    if sample_rate <= 0:
        raise ComputeError("sample_rate 必須大於 0。")
        
    try:
        win = scipy.signal.get_window(window, N)
        windowed_data = y * win
        spectrum = np.fft.rfft(windowed_data)
        psd = (np.abs(spectrum) ** 2) / N
        freqs = np.fft.rfftfreq(N, d=1.0/sample_rate)
    except Exception as e:
        raise ComputeError(f"功率譜計算失敗: {e}")
        
    end_time = time.perf_counter_ns()
    return ComputeResult(
        data=psd,
        parameters_used={'sample_rate': sample_rate, 'window': window},
        execution_time_ms=(end_time - start_time) / 1_000_000.0,
        metadata={'frequencies': freqs.tolist()}
    )

def bandpass_filter(data: NDArray[np.float64], low_freq: float, high_freq: float, sample_rate: float = 1.0, order: int = 5) -> ComputeResult:
    """
    使用零相位巴特沃斯帶通濾波器對數據進行濾波。

    Args:
        data: 輸入資料陣列。
        low_freq: 低頻截止頻率。
        high_freq: 高頻截止頻率。
        sample_rate: 採樣頻率。
        order: 濾波器階數。

    Returns:
        ComputeResult: 包含濾波後訊號及執行時間。
        
    Raises:
        ComputeError: 參數驗證失敗時拋出。
    """
    start_time = time.perf_counter_ns()
    y = np.array(data, copy=True, dtype=np.float64)
    
    if sample_rate <= 0:
        raise ComputeError("sample_rate 必須大於 0。")
    if low_freq < 0 or high_freq <= low_freq:
        raise ComputeError("頻率設定錯誤：必須滿足 0 <= low_freq < high_freq。")
    nyquist = 0.5 * sample_rate
    if high_freq >= nyquist:
        raise ComputeError("high_freq 必須小於 Nyquist 頻率 (sample_rate / 2)。")
        
    try:
        b, a = scipy.signal.butter(order, [low_freq / nyquist, high_freq / nyquist], btype='band')
        filtered = scipy.signal.filtfilt(b, a, y)
    except Exception as e:
        raise ComputeError(f"帶通濾波運算失敗: {e}")
        
    end_time = time.perf_counter_ns()
    return ComputeResult(
        data=filtered,
        parameters_used={'low_freq': low_freq, 'high_freq': high_freq, 'sample_rate': sample_rate, 'order': order},
        execution_time_ms=(end_time - start_time) / 1_000_000.0,
        metadata={}
    )
