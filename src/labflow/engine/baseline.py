"""
光譜基線處理引擎模組。

提供 XPS 與光譜分析關鍵的基線扣除演算法，包含多項式、Shirley、Tougaard 以及 ALS。
所有函式皆為純函式，不改變輸入資料。
"""

import time
import logging
from typing import Optional, List, Tuple
import numpy as np
import scipy.sparse as sparse
from scipy.sparse.linalg import spsolve

from labflow.core.types import ComputeResult, ConvergenceInfo
from labflow.core.errors import ComputeError

logger = logging.getLogger(__name__)

def polynomial_baseline(
    data: np.ndarray,
    x: Optional[np.ndarray] = None,
    order: int = 3,
    regions: Optional[List[Tuple[int, int]]] = None
) -> ComputeResult:
    """
    計算多項式基線。

    Args:
        data: 一維資料陣列。
        x: 一維 X 軸資料陣列 (可選)。
        order: 多項式階數。
        regions: 欲配適基線的資料區段索引 (start_idx, end_idx) 列表 (可選)。

    Returns:
        ComputeResult 包含扣除基線後的資料與元資料。
    """
    start_time = time.perf_counter_ns()
    
    try:
        data = np.asarray(data)
        if x is None:
            x = np.arange(len(data))
        else:
            x = np.asarray(x)
            
        if np.isnan(data).any() or np.isnan(x).any():
            raise ValueError("輸入資料包含 NaN")

        if regions is not None:
            mask = np.zeros(len(data), dtype=bool)
            for start, end in regions:
                mask[start:end] = True
            fit_x = x[mask]
            fit_data = data[mask]
        else:
            fit_x = x
            fit_data = data
            
        coeffs = np.polyfit(fit_x, fit_data, order)
        baseline = np.polyval(coeffs, x)
        result_data = data - baseline
        
        exec_time_ms = (time.perf_counter_ns() - start_time) / 1e6
        return ComputeResult(
            data=result_data,
            execution_time_ms=exec_time_ms,
            metadata={'baseline': baseline, 'coefficients': coeffs},
            parameters_used={'order': order, 'regions': regions}
        )
    except Exception as e:
        logger.error(f"多項式基線計算失敗: {str(e)}")
        raise ComputeError(f"多項式基線計算失敗: {str(e)}") from e

def shirley_baseline(
    data: np.ndarray,
    x: Optional[np.ndarray] = None,
    max_iterations: int = 50,
    tolerance: float = 1e-6
) -> ComputeResult:
    """
    計算 Shirley 基線 (XPS 分析關鍵)。

    Args:
        data: 一維資料陣列。
        x: 一維 X 軸資料陣列 (可選)。
        max_iterations: 最大迭代次數。
        tolerance: 收斂容差。

    Returns:
        ComputeResult 包含扣除基線後的資料與元資料。
    """
    start_time = time.perf_counter_ns()
    
    try:
        data = np.asarray(data)
        n = len(data)
        if n < 2:
            raise ValueError("資料點數不足")
            
        if np.isnan(data).any():
            raise ValueError("輸入資料包含 NaN")

        # 假設資料由低動能到高動能 (結合能由高到低) 或相反。
        # Shirley公式: B_i = I_n + (I_0 - I_n) * sum_{j=i}^n (I_j - B_j) / sum_{j=0}^n (I_j - B_j)
        # 此處採用簡單實現，假設背景由兩端點決定。
        i_left = data[0]
        i_right = data[-1]
        
        # 初始基線為直線
        baseline = np.linspace(i_left, i_right, n)
        
        converged = False
        iterations = 0
        
        for it in range(max_iterations):
            iterations = it + 1
            old_baseline = baseline.copy()
            
            # 計算積分區間 (從 i 到 n 的積分)
            intensity_diff = data - old_baseline
            intensity_diff = np.where(intensity_diff < 0, 0, intensity_diff) # 避免負值
            
            # 累加積分
            integral = np.cumsum(intensity_diff[::-1])[::-1]
            total_integral = integral[0]
            
            if total_integral == 0:
                break
                
            baseline = i_right + (i_left - i_right) * integral / total_integral
            
            # 檢查收斂
            change = np.max(np.abs(baseline - old_baseline))
            if change < tolerance:
                converged = True
                break
                
        result_data = data - baseline
        
        exec_time_ms = (time.perf_counter_ns() - start_time) / 1e6
        conv_info = ConvergenceInfo(converged=converged, iterations=iterations, residual_norm=tolerance)
        return ComputeResult(
            data=result_data,
            execution_time_ms=exec_time_ms,
            metadata={'baseline': baseline},
            parameters_used={'max_iterations': max_iterations, 'tolerance': tolerance},
            convergence=conv_info
        )
    except Exception as e:
        logger.error(f"Shirley基線計算失敗: {str(e)}")
        raise ComputeError(f"Shirley基線計算失敗: {str(e)}") from e

def tougaard_baseline(
    data: np.ndarray,
    x: Optional[np.ndarray] = None,
    B: float = 2866.0,
    C: float = 1643.0,
    C_prime: float = 1.0,
    D: float = 1.0,
    max_iterations: int = 50,
    tolerance: float = 1e-6
) -> ComputeResult:
    """
    計算 Tougaard 基線 (XPS 分析關鍵)。

    Args:
        data: 一維資料陣列。
        x: 一維 X 軸資料陣列 (可選，但 Tougaard 通常需要能量軸)。
        B, C, C_prime, D: Tougaard 截面參數。
        max_iterations: 最大迭代次數。
        tolerance: 收斂容差。

    Returns:
        ComputeResult 包含扣除基線後的資料與元資料。
    """
    start_time = time.perf_counter_ns()
    
    try:
        data = np.asarray(data)
        if x is None:
            x = np.arange(len(data), dtype=float)
        else:
            x = np.asarray(x, dtype=float)
            
        if len(data) != len(x):
            raise ValueError("data 與 x 長度不一致")

        # 簡單實現：假設 x 為動能
        # B_tougaard(E) = \int K(T) * (I(E-T) - B(E-T)) dT
        # 這裡僅作簡單的單步或迭代逼近，採用通用 Tougaard: K(T) = B*T / (C + T^2)^2
        n = len(data)
        baseline = np.zeros_like(data)
        
        # 確保 x 排序正確，假設間隔均勻
        dx = np.abs(x[1] - x[0])
        
        # 計算 K(T) 陣列，T = x_j - x_i
        # 這裡簡化為兩參數 Tougaard (C_prime, D 忽略，使用標準形式)
        # K(T) = B*T / (C + T^2)^2
        T = np.arange(n) * dx
        K = B * T / (C + T**2)**2
        
        converged = False
        iterations = 0
        
        for it in range(max_iterations):
            iterations = it + 1
            old_baseline = baseline.copy()
            diff = data - old_baseline
            
            # 使用卷積計算積分 (此處簡化為簡單求和以示範)
            # 實際 XPS Tougaard 通常是向低動能方向積分
            for i in range(n):
                # 從 E_i 向高動能(即資料中的某側)積分
                # 這裡簡化為全區間卷積
                baseline[i] = np.sum(K[:n-i] * diff[i:]) * dx
                
            change = np.max(np.abs(baseline - old_baseline))
            if change < tolerance:
                converged = True
                break
                
        result_data = data - baseline
        
        exec_time_ms = (time.perf_counter_ns() - start_time) / 1e6
        conv_info = ConvergenceInfo(converged=converged, iterations=iterations, residual_norm=tolerance)
        return ComputeResult(
            data=result_data,
            execution_time_ms=exec_time_ms,
            metadata={'baseline': baseline},
            parameters_used={'B': B, 'C': C, 'C_prime': C_prime, 'D': D},
            convergence=conv_info
        )
    except Exception as e:
        logger.error(f"Tougaard基線計算失敗: {str(e)}")
        raise ComputeError(f"Tougaard基線計算失敗: {str(e)}") from e

def als_baseline(
    data: np.ndarray,
    lam: float = 1e6,
    p: float = 0.01,
    max_iterations: int = 50,
    tolerance: float = 1e-6
) -> ComputeResult:
    """
    計算 Asymmetric Least Squares (ALS) 基線。

    Args:
        data: 一維資料陣列。
        lam: 平滑參數 (lambda)。
        p: 不對稱權重 (通常為 0.001 ~ 0.1)。
        max_iterations: 最大迭代次數。
        tolerance: 收斂容差。

    Returns:
        ComputeResult 包含扣除基線後的資料與元資料。
    """
    start_time = time.perf_counter_ns()
    
    try:
        data = np.asarray(data)
        n = len(data)
        D = sparse.diags([1, -2, 1], [0, 1, 2], shape=(n-2, n))
        D = lam * D.transpose().dot(D)
        
        w = np.ones(n)
        W = sparse.spdiags(w, 0, n, n)
        
        baseline = data.copy()
        converged = False
        iterations = 0
        
        for it in range(max_iterations):
            iterations = it + 1
            W.setdiag(w)
            Z = W + D
            
            old_baseline = baseline.copy()
            baseline = spsolve(Z, w * data)
            
            # 更新權重
            w = p * (data > baseline) + (1 - p) * (data <= baseline)
            
            change = np.linalg.norm(baseline - old_baseline) / np.linalg.norm(old_baseline + 1e-8)
            if change < tolerance:
                converged = True
                break
                
        result_data = data - baseline
        
        exec_time_ms = (time.perf_counter_ns() - start_time) / 1e6
        conv_info = ConvergenceInfo(converged=converged, iterations=iterations, residual_norm=tolerance)
        return ComputeResult(
            data=result_data,
            execution_time_ms=exec_time_ms,
            metadata={'baseline': baseline},
            parameters_used={'lam': lam, 'p': p},
            convergence=conv_info
        )
    except Exception as e:
        logger.error(f"ALS基線計算失敗: {str(e)}")
        raise ComputeError(f"ALS基線計算失敗: {str(e)}") from e
