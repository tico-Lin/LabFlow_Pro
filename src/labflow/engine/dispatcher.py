import logging
from concurrent.futures import ThreadPoolExecutor, Future
from typing import Any, Callable, Optional, Dict
import numpy as np

from PySide6.QtCore import QTimer

from labflow.core.event_bus import EventBus
from labflow.core.events import ComputeCompleted
from labflow.core.types import ComputeResult
from labflow.engine.registry import EngineRegistry

logger = logging.getLogger(__name__)

class ComputationFailed:
    """計算失敗事件。"""
    def __init__(self, task_id: str, func_name: str, error: Exception):
        self.task_id = task_id
        self.func_name = func_name
        self.error = error

class ComputeDispatcher:
    """
    非同步計算分派器。
    
    負責將計算工作分派至執行緒池執行，並透過 EventBus 在主執行緒觸發事件。
    註: 目前使用 ThreadPoolExecutor。對於需要真正平行處理且不受 GIL 限制的任務，
    可考慮切換至 ProcessPoolExecutor，但須注意 ProcessPoolExecutor 要求參數可被序列化(Pickle)。
    """
    
    def __init__(self, event_bus: 'EventBus', max_workers: int = 4) -> None:
        self._event_bus = event_bus
        self._executor = ThreadPoolExecutor(max_workers=max_workers, thread_name_prefix="ComputeEngine")
        self._registry = EngineRegistry()
        self._pending_tasks: Dict[str, Future] = {}
        logger.info(f"ComputeDispatcher 已初始化，工作執行緒數: {max_workers}")

    @property
    def pending_count(self) -> int:
        """取得目前排隊中或正在執行的任務數量"""
        # 過濾掉已經完成的 future 以取得準確數量
        self._pending_tasks = {k: v for k, v in self._pending_tasks.items() if not v.done()}
        return len(self._pending_tasks)

    def submit(self, func_name: str, data: np.ndarray, callback: Optional[Callable[[ComputeResult], None]] = None, **kwargs: Any) -> Future:
        """
        非同步提交計算任務。
        
        任務完成後會透過 QTimer.singleShot 將 ComputeCompleted 事件派發到主執行緒的 EventBus。
        如果失敗，則派發 ComputationFailed 事件。
        
        Args:
            func_name: 計算函式的名稱
            data: 輸入陣列資料
            callback: 選擇性的回呼函式，在完成時被呼叫
            kwargs: 其他參數
            
        Returns:
            Future 物件
        """
        try:
            func = self._registry.get(func_name)
        except KeyError as e:
            logger.error(f"無法提交任務: {e}")
            raise
            
        task_id = f"{func_name}_{id(data)}_{id(kwargs)}"
        
        future = self._executor.submit(func, data, **kwargs)
        self._pending_tasks[task_id] = future
        
        def _on_done(f: Future) -> None:
            try:
                result = f.result()
                
                # 在主執行緒觸發成功事件與回呼
                def _dispatch_success() -> None:
                    event = ComputeCompleted(result=result)
                    self._event_bus.emit(event)
                    if callback:
                        try:
                            callback(result)
                        except Exception as cb_err:
                            logger.error(f"回呼函式執行失敗: {cb_err}", exc_info=True)
                            
                QTimer.singleShot(0, _dispatch_success)
                
            except Exception as e:
                logger.error(f"計算任務 '{func_name}' 執行失敗: {e}", exc_info=True)
                
                # 在主執行緒觸發失敗事件
                def _dispatch_error() -> None:
                    event = ComputationFailed(task_id=task_id, func_name=func_name, error=e)
                    self._event_bus.emit(event)
                    
                QTimer.singleShot(0, _dispatch_error)

        future.add_done_callback(_on_done)
        return future

    def submit_sync(self, func_name: str, data: np.ndarray, **kwargs: Any) -> ComputeResult:
        """
        同步執行計算任務。適合快速計算或不需要非同步的場合。
        
        Args:
            func_name: 計算函式的名稱
            data: 輸入陣列資料
            kwargs: 其他參數
            
        Returns:
            計算結果 ComputeResult
        """
        func = self._registry.get(func_name)
        return func(data, **kwargs)

    def shutdown(self, wait: bool = True) -> None:
        """
        關閉分派器，清理執行緒池。
        """
        logger.info("正在關閉 ComputeDispatcher...")
        self._executor.shutdown(wait=wait)
        logger.info("ComputeDispatcher 已關閉。")
