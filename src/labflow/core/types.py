"""
核心模組的共用型別定義。
"""
from typing import TypedDict, Literal, Any, NamedTuple
from dataclasses import dataclass, field
import numpy as np
import numpy.typing as npt

DatasetId = str
NodePath = str

class ColumnSpec(TypedDict):
    """資料行規格。"""
    name: str
    unit: str
    dtype: str
    format_str: str
    col_type: Literal['X', 'Y', 'Z', 'E', 'L']

class AxisRange(NamedTuple):
    """座標軸範圍。"""
    min_val: float
    max_val: float

@dataclass(frozen=True)
class ConvergenceInfo:
    """求解器收斂狀態資訊。"""
    converged: bool
    iterations: int = 0
    residual_norm: float = float('inf')
    message: str = ""

@dataclass(frozen=True)
class ComputeResult:
    """
    統一的計算結果容器。

    所有計算引擎函式必須回傳此型別，確保整個系統的一致性。

    Attributes:
        data: 主要輸出陣列（計算結果）。
        parameters_used: 實際使用的計算參數（含預設值展開後的完整參數）。
        execution_time_ms: 計算執行時間（毫秒）。
        convergence: 求解器收斂狀態（僅適用於迭代演算法）。
        metadata: 額外的計算元資料（演算法名稱、版本等）。
        residuals: 可選的殘差陣列（適用於擬合演算法）。
        covariance: 可選的協方差矩陣（適用於擬合演算法）。
    """
    data: npt.NDArray[Any]
    parameters_used: dict[str, Any] = field(default_factory=dict)
    execution_time_ms: float = 0.0
    convergence: ConvergenceInfo | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    residuals: npt.NDArray[Any] | None = None
    covariance: npt.NDArray[Any] | None = None

