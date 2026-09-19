"""
傅立葉變換單元測試 (Unit Tests for FFT Engine)
"""
import pytest
import numpy as np
from labflow.engine.fft import fft_forward, fft_inverse, power_spectrum, bandpass_filter

def test_fft_roundtrip():
    """測試 FFT 往返：前向後逆向應還原原始訊號 (由於前向只回傳振幅，此處以手動建立複數頻譜測試逆向)。"""
    t = np.linspace(0, 1, 100)
    signal = np.sin(2 * np.pi * 5 * t)
    
    # 測試前向
    fft_res = fft_forward(signal)
    assert len(fft_res.data) == len(np.fft.rfft(signal))
    assert fft_res.execution_time_ms > 0
    
    # 測試逆向 (使用 numpy 的 rfft 來取得完整複數頻譜)
    complex_spectrum = np.fft.rfft(signal)
    ifft_res = fft_inverse(complex_spectrum, n=len(signal))
    np.testing.assert_allclose(ifft_res.data, signal, rtol=1e-5, atol=1e-5)

def test_power_spectrum():
    """測試功率頻譜：單一正弦波應在正確頻率顯示峰值。"""
    fs = 100
    t = np.arange(0, 1, 1/fs)
    freq_true = 10
    signal = np.sin(2 * np.pi * freq_true * t)
    
    result = power_spectrum(signal, fs)
    freqs = result.metadata["frequencies"]
    power = result.data
    
    idx_max = np.argmax(power)
    assert np.isclose(freqs[idx_max], freq_true)

def test_bandpass_filter():
    """測試帶通濾波器：保留特定頻率。"""
    fs = 100
    t = np.arange(0, 1, 1/fs)
    signal = np.sin(2 * np.pi * 5 * t) + np.sin(2 * np.pi * 20 * t)
    
    # 過濾只保留 5Hz，頻帶設為 1 到 10 Hz
    result = bandpass_filter(signal, 1, 10, sample_rate=fs)
    
    # 過濾後的訊號應與單一的 5Hz 正弦波相似
    expected = np.sin(2 * np.pi * 5 * t)
    # 邊緣可能有效應，測試中間部分
    np.testing.assert_allclose(result.data[10:-10], expected[10:-10], rtol=0.5, atol=0.5)
