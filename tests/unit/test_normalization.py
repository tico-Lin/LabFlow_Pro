"""
正規化單元測試 (Unit Tests for Normalization Engine)
"""
import pytest
import numpy as np
from labflow.engine.normalization import (
    min_max_normalize, z_score_normalize, area_normalize, max_normalize
)

def test_min_max_normalize():
    """測試 min-max 正規化，範圍應介於 [0, 1] 之間。"""
    data = np.array([1.0, 2.0, 3.0, 4.0, 5.0])
    result = min_max_normalize(data)
    
    assert np.isclose(np.min(result.data), 0.0)
    assert np.isclose(np.max(result.data), 1.0)
    assert result.execution_time_ms > 0

def test_z_score_normalize():
    """測試 z-score 正規化，均值應為 0，標準差應為 1。"""
    data = np.random.normal(10, 2, 1000)
    result = z_score_normalize(data)
    
    assert np.isclose(np.mean(result.data), 0.0, atol=1e-7)
    assert np.isclose(np.std(result.data, ddof=1), 1.0, atol=1e-7)

def test_area_normalize():
    """測試面積正規化，積分應為 1。"""
    x = np.linspace(0, 10, 100)
    data = np.exp(-((x - 5)**2))  # 高斯曲線
    result = area_normalize(data, x)
    
    area = np.trapezoid(result.data, x)
    assert np.isclose(area, 1.0)

def test_max_normalize():
    """測試最大值正規化，最大值應為 1。"""
    data = np.array([10.0, 50.0, 20.0, 0.0])
    result = max_normalize(data)
    
    assert np.isclose(np.max(result.data), 1.0)
    assert np.isclose(result.data[1], 1.0)
