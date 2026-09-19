"""
微分處理單元測試 (Unit Tests for Differentiation Engine)。
"""
import numpy as np
from labflow.engine.differentiation import numerical_derivative, savitzky_golay_derivative


def test_derivative_sin():
    """測試：sin(x) 的一階導數應為 cos(x)。"""
    x = np.linspace(0, 2 * np.pi, 1000)
    y = np.sin(x)
    result = numerical_derivative(y, x=x, order=1, method='central')

    y_prime_true = np.cos(x)
    np.testing.assert_allclose(result.data[1:-1], y_prime_true[1:-1], rtol=1e-2, atol=1e-2)
    assert result.execution_time_ms > 0


def test_derivative_poly():
    """測試：x^2 的一階導數應為 2x。"""
    x = np.linspace(-10, 10, 200)
    y = x ** 2
    result = numerical_derivative(y, x=x, order=1, method='central')

    y_prime_true = 2 * x
    np.testing.assert_allclose(result.data[1:-1], y_prime_true[1:-1], rtol=1e-2, atol=1e-2)


def test_second_derivative_poly():
    """測試：x^3 的二階導數應為 6x。"""
    x = np.linspace(-10, 10, 500)
    y = x ** 3
    result = numerical_derivative(y, x=x, order=2, method='central')

    y_double_prime_true = 6 * x
    # 二階導數的數值精度會降低，放寬容差
    np.testing.assert_allclose(result.data[2:-2], y_double_prime_true[2:-2], rtol=0.05, atol=0.5)


def test_savitzky_golay_derivative():
    """測試 savitzky_golay_derivative 的準確性。"""
    x = np.linspace(0, 10, 200)
    y = x ** 2
    result = savitzky_golay_derivative(y, x=x, window_length=11, polyorder=3, deriv=1)

    y_prime_true = 2 * x
    np.testing.assert_allclose(result.data[5:-5], y_prime_true[5:-5], rtol=0.02, atol=0.1)
