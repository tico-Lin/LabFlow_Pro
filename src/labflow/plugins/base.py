"""
插件基礎模組，定義插件的介面。
"""

import logging
from typing import Protocol, runtime_checkable

logger = logging.getLogger(__name__)

@runtime_checkable
class Plugin(Protocol):
    """
    插件介面協議 (Protocol)。
    所有外部插件必須實作此介面。
    """
    
    @property
    def name(self) -> str:
        """插件名稱"""
        ...
        
    @property
    def version(self) -> str:
        """插件版本"""
        ...
        
    @property
    def description(self) -> str:
        """插件描述"""
        ...
        
    def execute(self, ctx: 'LabFlowContext') -> None:
        """
        執行插件的主要邏輯。
        
        :param ctx: 應用程式上下文環境 (LabFlowContext)
        """
        ...
