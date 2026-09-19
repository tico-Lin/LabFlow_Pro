"""
API Facade 模組，提供插件與腳本安全存取 LabFlow Pro 核心功能的介面。
"""

import logging
from typing import Any
from dataclasses import dataclass
import numpy as np

# 假設 Kernel 定義在 labflow.core.kernel
from labflow.core.kernel import Kernel

logger = logging.getLogger(__name__)

@dataclass(frozen=True)
class PlotRequestedEvent:
    """請求繪圖的事件。"""
    data: np.ndarray
    target_layer: int
    plot_type: str

class LabFlowContext:
    """
    LabFlow API 的 Facade 類別，作為插件和腳本與核心系統互動的橋樑。
    確保所有操作都在安全的範圍內進行，不會直接操作 Qt UI 執行緒。
    """
    
    def __init__(self, kernel: Kernel) -> None:
        """
        初始化 LabFlowContext。
        
        :param kernel: 核心系統實例 (Kernel)
        """
        self._kernel = kernel
        logger.info("LabFlowContext 初始化完成。")

    def get_dataset(self, path: str) -> np.ndarray:
        """
        從 DataStore 安全地讀取資料。
        
        :param path: 資料集路徑
        :return: 包含資料的 numpy 陣列
        """
        try:
            logger.info(f"嘗試讀取資料集: %s", path)
            handle = self._kernel.get_data_store().get_dataset(path)
            data = handle.read()
            if not isinstance(data, np.ndarray):
                data = np.array(data)
            return data
        except Exception as e:
            logger.error(f"讀取資料集 %s 失敗: %s", path, e)
            raise RuntimeError(f"讀取資料集失敗: {e}") from e

    def plot(self, path_or_data: str | np.ndarray, target_layer: int = 0, plot_type: str = 'line') -> None:
        """
        請求繪製資料。如果是字串，會先從 DataStore 讀取資料。
        透過 EventBus 發送事件，由 UI 接收並繪製，避免直接修改 UI。
        
        :param path_or_data: 資料集路徑或 numpy 陣列資料
        :param target_layer: 目標圖層索引
        :param plot_type: 繪圖類型 (例如 'line', 'scatter')
        """
        try:
            if isinstance(path_or_data, str):
                data = self.get_dataset(path_or_data)
            else:
                data = path_or_data

            event = PlotRequestedEvent(
                data=data,
                target_layer=target_layer,
                plot_type=plot_type
            )
            logger.info(f"發送繪圖請求事件: 圖層 %d, 類型 %s", target_layer, plot_type)
            # 假設 kernel.event_bus 提供了 publish 方法
            self._kernel.event_bus.publish("PlotRequestedEvent", event)
        except Exception as e:
            logger.error(f"繪圖請求失敗: %s", e)
            raise RuntimeError(f"繪圖請求失敗: {e}") from e

    def run_analysis(self, func_name: str, data: np.ndarray, **kwargs: Any) -> Any:
        """
        觸發運算工作流程，不修改核心程式碼。
        使用引擎分配器非同步執行演算法，並回傳 Future 或標準化輸出。
        
        :param func_name: 演算法函式名稱
        :param data: 待分析的資料
        :param kwargs: 傳遞給演算法的其他參數
        :return: 執行結果 (可能是 Future 或直接結果)
        """
        try:
            logger.info(f"提交分析任務: %s", func_name)
            # 假設 kernel.engine_dispatcher 提供了 submit 方法
            result = self._kernel.engine_dispatcher.submit(func_name, data, **kwargs)
            return result
        except Exception as e:
            logger.error(f"執行分析任務 %s 失敗: %s", func_name, e)
            raise RuntimeError(f"執行分析任務失敗: {e}") from e
