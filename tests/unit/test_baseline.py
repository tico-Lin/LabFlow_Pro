"""
基線校正單元測試 (Unit Tests for Baseline Engine)
"""
import pytest
import numpy as np
from labflow.engine.baseline import polynomial_baseline, shirley_baseline, als_baseline

def test_polynomial_baseline():
    """測試 polynomial_baseline：驗證相減後能還原真實訊號。"""
    x = np.linspace(0, 10, 100)
    signal = np.exp(-((x - 5)**2))  # 真實訊號 (Gaussian)
    baseline_true = 0.5 * x + 1.0   # 多項式基線
    y = signal + baseline_true
    # 只用首尾區段來配適基線，避免中間的 Gaussian 訊號影響
    result = polynomial_baseline(y, x, order=1, regions=[(0, 20), (80, 100)])
    # result.metadata['baseline'] 為擬合出的基線
    np.testing.assert_allclose(result.metadata['baseline'], baseline_true, rtol=1e-2, atol=1e-2)
    assert result.execution_time_ms > 0

def test_shirley_baseline():
    """測試 shirley_baseline：驗證演算法的收斂性。"""
    x = np.linspace(0, 100, 100)
    # 建立一個簡單的步階狀數據來模擬 XPS 光譜
    y = np.zeros_like(x)
    y[50:] = 10.0
    y += np.random.normal(0, 0.1, 100)
    
    result = shirley_baseline(y, x, max_iterations=50, tolerance=1e-4)
    assert result.data.shape == y.shape
    assert result.convergence.converged is True

def test_als_baseline():
    """測試 als_baseline (Asymmetric Least Squares)：驗證收斂性與結果形狀。"""
    x = np.linspace(0, 100, 200)
    signal = np.exp(-((x - 50)**2) / 10)
    baseline_true = 5.0 + 0.05 * x
    y = signal + baseline_true + np.random.normal(0, 0.1, 200)
    
    result = als_baseline(y, lam=1e4, p=0.01, max_iterations=20)
    assert result.data.shape == y.shape
    assert result.convergence.converged is True
    # 基線應趨近於真實基線
    np.testing.assert_allclose(result.metadata['baseline'], baseline_true, rtol=0.1, atol=1.0)
