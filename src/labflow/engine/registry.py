import logging
from typing import Dict, List, Optional
from threading import Lock

from labflow.engine.base import ComputeFunction

logger = logging.getLogger(__name__)

class EngineRegistry:
    """引擎演算法註冊表 (Singleton)。管理所有可用的計算函式。"""
    
    _instance: Optional['EngineRegistry'] = None
    _lock = Lock()
    
    def __new__(cls) -> 'EngineRegistry':
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                cls._instance._functions = {}
                cls._instance._initialized = False
            return cls._instance
            
    def __init__(self) -> None:
        if getattr(self, '_initialized', False):
            return
            
        self._functions: Dict[str, ComputeFunction] = {}
        self._initialized = True
        self._auto_discover()
        
    def _auto_discover(self) -> None:
        """自動探索並註冊內建的計算函式"""
        logger.info("自動探索引擎計算函式...")
        # TODO: 實作自動探索邏輯，例如匯入內建模組以觸發註冊
        pass

    def register(self, func: ComputeFunction) -> None:
        """
        註冊一個計算函式。
        
        Args:
            func: 實作 ComputeFunction 協定的函式
        """
        with self._lock:
            if func.name in self._functions:
                logger.warning(f"計算函式 '{func.name}' 已存在，將被覆蓋。")
            self._functions[func.name] = func
            logger.debug(f"已註冊計算函式: {func.name}")
            
    def get(self, name: str) -> ComputeFunction:
        """
        取得指定的計算函式。
        
        Args:
            name: 函式名稱
            
        Returns:
            註冊的計算函式
            
        Raises:
            KeyError: 如果找不到該名稱的函式
        """
        with self._lock:
            if name not in self._functions:
                raise KeyError(f"找不到計算函式: {name}")
            return self._functions[name]
            
    def list_functions(self) -> List[str]:
        """列出所有已註冊的計算函式名稱"""
        with self._lock:
            return list(self._functions.keys())
            
    def list_by_category(self, category: str) -> List[str]:
        """
        列出指定類別的計算函式名稱。
        
        Args:
            category: 類別名稱
            
        Returns:
            符合類別的函式名稱列表
        """
        with self._lock:
            return [
                name for name, func in self._functions.items() 
                if getattr(func, 'category', '') == category
            ]
            
    def get_all(self) -> Dict[str, ComputeFunction]:
        """取得所有已註冊的計算函式"""
        with self._lock:
            return dict(self._functions)

# 提供一個全域實例以方便使用
registry = EngineRegistry()
