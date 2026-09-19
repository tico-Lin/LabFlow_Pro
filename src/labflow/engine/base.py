import logging
import time
from functools import wraps
from typing import Any, Callable, Protocol, TypeVar, cast
import numpy as np

from labflow.core.types import ComputeResult
from labflow.core.errors import ComputeError

logger = logging.getLogger(__name__)

F = TypeVar('F', bound=Callable[..., ComputeResult])

class ComputeFunction(Protocol):
    """計算函式協定。所有引擎演算法必須遵循此介面。"""
    @property
    def name(self) -> str: ...
    
    @property
    def description(self) -> str: ...
    
    @property  
    def category(self) -> str: ...
    
    def __call__(self, data: np.ndarray, **kwargs: Any) -> ComputeResult: ...

def compute_function(name: str, description: str = "", category: str = "general"):
    """
    將一般函式包裝為 ComputeFunction 的裝飾器。
    - 自動測量執行時間
    - 確保輸入陣列不被修改
    - 捕捉例外並包裝為 ComputeError
    - 自動填寫 metadata['algorithm']
    """
    def decorator(func: Callable[..., ComputeResult]) -> ComputeFunction:
        @wraps(func)
        def wrapper(data: np.ndarray, **kwargs: Any) -> ComputeResult:
            start_time = time.perf_counter_ns()
            
            # 確保資料不可變（或建立副本）
            if data.flags.writeable:
                data = data.copy()
                data.flags.writeable = False

            try:
                result = func(data, **kwargs)
                
                # 計算執行時間（毫秒）
                execution_time_ms = (time.perf_counter_ns() - start_time) / 1e6
                
                # 更新執行時間與詮釋資料
                new_metadata = dict(result.metadata) if result.metadata else {}
                new_metadata["algorithm"] = name
                
                return ComputeResult(
                    data=result.data,
                    parameters_used=result.parameters_used,
                    execution_time_ms=execution_time_ms,
                    convergence=result.convergence,
                    metadata=new_metadata,
                    residuals=result.residuals,
                    covariance=result.covariance
                )
                
            except Exception as e:
                logger.error(f"Computation '{name}' failed: {str(e)}", exc_info=True)
                if isinstance(e, ComputeError):
                    raise
                raise ComputeError(f"計算過程發生錯誤: {str(e)}") from e
                
        # 附加屬性以符合 ComputeFunction 協定
        wrapper.name = name  # type: ignore
        wrapper.description = description  # type: ignore
        wrapper.category = category  # type: ignore
        
        return cast(ComputeFunction, wrapper)
    return decorator
