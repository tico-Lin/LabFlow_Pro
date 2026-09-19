"""
平滑處理單元測試 (Unit Tests for Smoothing Engine)
"""
import pytest
import numpy as np
from labflow.engine.smoothing import savitzky_golay, moving_average, gaussian_smooth
from labflow.core.errors import ComputeError

def test_savitzky_golay():
    """測試 Savitzky-Golay 平滑：測試對正弦波加雜訊的去噪效果。"""
    x = np.linspace(0, 2*np.pi, 100)
    y_true = np.sin(x)
    y_noisy = y_true + np.random.normal(0, 0.1, 100)
    
    result = savitzky_golay(y_noisy, window_length=11, polyorder=2)
    assert result.data.shape == y_noisy.shape
    
    # 平滑後的訊號應該比帶雜訊的訊號更接近原始真實訊號
    error_noisy = np.sum((y_noisy - y_true)**2)
    error_smooth = np.sum((result.data - y_true)**2)
    assert error_smooth < error_noisy
    assert result.execution_time_ms > 0

def test_savitzky_golay_invalid_params():
    """測試非法的參數處理：視窗長度必須為奇數等。"""
    y = np.ones(10)
    with pytest.raises(ComputeError):
        savitzky_golay(y, window_length=10, polyorder=2)

def test_moving_average():
    """測試移動平均：對階躍函數的平滑過渡。"""
    y = np.concatenate([np.zeros(10), np.ones(10)])
    result = moving_average(y, window_size=3)
    
    assert result.data.shape == y.shape
    # 過渡區域應該平滑，中間會有介於 0 與 1 之間的值
    assert 0 < result.data[10] < 1

def test_gaussian_smooth():
    """測試高斯平滑：對 Delta 函數的平滑效果應為高斯分布。"""
    y = np.zeros(21)
    y[10] = 1.0  # Delta function at the center
    result = gaussian_smooth(y, sigma=1.0)
    
    assert result.data.shape == y.shape
    assert result.data[10] > result.data[9]
    assert np.isclose(result.data[9], result.data[11])
