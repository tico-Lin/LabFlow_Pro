"""
統計分析單元測試 (Unit Tests for Statistics Engine)
"""
import pytest
import numpy as np
from labflow.engine.statistics import descriptive_stats, linear_regression
from labflow.core.errors import ComputeError

def test_descriptive_stats():
    """測試描述性統計與 NumPy 結果的比對。"""
    data = np.array([1, 2, 3, 4, 5], dtype=float)
    result = descriptive_stats(data)
    
    meta = result.metadata
    assert np.isclose(meta["mean"], 3.0)
    assert np.isclose(meta["median"], 3.0)
    assert np.isclose(meta["min"], 1.0)
    assert np.isclose(meta["max"], 5.0)
    assert np.isclose(meta["sum"], 15.0)
    assert meta["count"] == 5
    assert result.execution_time_ms > 0

def test_descriptive_stats_empty():
    """測試傳入空陣列是否會報錯。"""
    data = np.array([])
    with pytest.raises(ComputeError):
        descriptive_stats(data)

def test_linear_regression():
    """測試線性迴歸。y = 2x + 1"""
    x = np.array([0, 1, 2, 3, 4], dtype=float)
    y = 2 * x + 1
    
    result = linear_regression(y, x)
    meta = result.metadata
    
    assert np.isclose(meta["slope"], 2.0)
    assert np.isclose(meta["intercept"], 1.0)
    assert np.isclose(meta["r_squared"], 1.0)
    
    np.testing.assert_allclose(result.data, y)
