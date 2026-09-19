"""
事件匯流排 (Event Bus) 實作，負責管理事件廣播與命令派發。
"""
import weakref
import threading
import logging
from typing import Callable, Any, TypeVar, Type
from .events import Event
from .commands import Command

E = TypeVar('E', bound=Event)
C = TypeVar('C', bound=Command)

logger = logging.getLogger(__name__)

class EventBus:
    """型別安全的發布/訂閱事件匯流排。"""
    
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._subscribers: dict[Type[Event], weakref.WeakSet[Any]] = {}
        self._command_handlers: dict[Type[Command], Callable[[Command], Any]] = {}

    def subscribe(self, event_type: Type[E], handler: Callable[[E], Any]) -> None:
        """註冊事件處理器。"""
        with self._lock:
            if event_type not in self._subscribers:
                self._subscribers[event_type] = weakref.WeakSet()
            self._subscribers[event_type].add(handler)
            logger.debug(f"已註冊事件處理器: {event_type.__name__}")

    def unsubscribe(self, event_type: Type[E], handler: Callable[[E], Any]) -> None:
        """移除事件處理器。"""
        with self._lock:
            if event_type in self._subscribers:
                try:
                    self._subscribers[event_type].remove(handler)
                    logger.debug(f"已移除事件處理器: {event_type.__name__}")
                except KeyError:
                    pass

    def emit(self, event: Event) -> None:
        """廣播事件給所有訂閱者。"""
        event_type = type(event)
        handlers_to_call = []
        with self._lock:
            if event_type in self._subscribers:
                handlers_to_call = list(self._subscribers[event_type])
        
        logger.info(f"廣播事件: {event_type.__name__}")
        for handler in handlers_to_call:
            try:
                handler(event)
            except Exception as e:
                logger.error(f"執行事件處理器時發生錯誤: {event_type.__name__} - {e}", exc_info=True)

    def register_handler(self, command_type: Type[C], handler: Callable[[C], Any]) -> None:
        """註冊命令處理器 (每種命令僅限一個處理器)。"""
        with self._lock:
            if command_type in self._command_handlers:
                logger.warning(f"命令 {command_type.__name__} 的處理器已被覆蓋。")
            self._command_handlers[command_type] = handler
            logger.debug(f"已註冊命令處理器: {command_type.__name__}")

    def dispatch(self, command: Command) -> Any:
        """路由命令至其對應的處理器。"""
        command_type = type(command)
        with self._lock:
            handler = self._command_handlers.get(command_type)
            
        if not handler:
            logger.error(f"找不到命令的處理器: {command_type.__name__}")
            raise RuntimeError(f"找不到命令的處理器: {command_type.__name__}")

        logger.info(f"派發命令: {command_type.__name__} [{command.command_id}]")
        try:
            return handler(command)
        except Exception as e:
            logger.error(f"執行命令時發生錯誤: {command_type.__name__} - {e}", exc_info=True)
            raise
