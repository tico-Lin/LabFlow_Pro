"""
尋峰與擬合單元測試 (Unit Tests for Peak Fitting Engine)。
"""
import numpy as np
from labflow.engine.peak_fitting import (
    gaussian, lorentzian, fit_single_peak, fit_multi_peak, detect_peaks
)


def test_gaussian_profile():
    """測試高斯分布屬性：峰值高度應等於振幅。"""
    x = np.linspace(-5, 5, 1001)
    amp, cen, sig = 2.0, 0.0, 1.0
    y = gaussian(x, amp, cen, sig)

    assert np.isclose(np.max(y), amp, rtol=1e-3)
    # FWHM ≈ 2.355 * sigma
    half_max = amp / 2
    above_half = x[y >= half_max]
    fwhm = above_half[-1] - above_half[0]
    np.testing.assert_allclose(fwhm, 2.355 * sig, rtol=0.02)


def test_lorentzian_profile():
    """測試勞侖茲分布屬性：峰值高度應等於振幅。"""
    x = np.linspace(-10, 10, 1001)
    amp, cen, gamma = 2.0, 0.0, 1.0
    y = lorentzian(x, amp, cen, gamma)

    assert np.isclose(np.max(y), amp, rtol=1e-3)


def test_fit_single_peak():
    """測試 fit_single_peak 於合成高斯數據，驗證回復參數誤差在 5% 內。"""
    np.random.seed(42)
    x = np.linspace(0, 10, 200)
    true_amp, true_cen, true_sig = 5.0, 5.0, 0.8
    y = gaussian(x, true_amp, true_cen, true_sig) + np.random.normal(0, 0.05, len(x))

    result = fit_single_peak(y, x, profile='gaussian')

    assert result.convergence is not None
    assert result.convergence.converged is True
    assert result.execution_time_ms > 0
    # 檢查回復的參數
    np.testing.assert_allclose(result.parameters_used['amplitude'], true_amp, rtol=0.05)
    np.testing.assert_allclose(result.parameters_used['center'], true_cen, rtol=0.05)
    assert result.residuals is not None
    assert 'r_squared' in result.metadata
    assert result.metadata['r_squared'] > 0.95


def test_fit_multi_peak():
    """測試 fit_multi_peak 對兩個分離的高斯峰。"""
    x = np.linspace(0, 20, 400)
    y = gaussian(x, 5.0, 5.0, 1.0) + gaussian(x, 3.0, 15.0, 1.0)

    result = fit_multi_peak(y, x, n_peaks=2, profile='gaussian')

    assert result.convergence is not None
    assert result.convergence.converged is True
    assert 'r_squared' in result.metadata
    assert result.metadata['r_squared'] > 0.95
    assert 'individual_peaks' in result.metadata
    assert len(result.metadata['individual_peaks']) == 2


def test_detect_peaks():
    """測試尋峰功能。"""
    x = np.linspace(0, 20, 200)
    y = np.zeros_like(x)
    y[50] = 10.0
    y[150] = 5.0

    result = detect_peaks(y, height=3.0, distance=20)
    peaks = result.data

    assert len(peaks) == 2
    assert 50 in peaks
    assert 150 in peaks
    assert result.execution_time_ms > 0
