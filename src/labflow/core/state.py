import threading
import logging
from dataclasses import dataclass, replace
from pathlib import Path
from typing import Literal, Any

from .types import DatasetId
from .events import StateChanged
from .event_bus import EventBus

logger = logging.getLogger(__name__)

@dataclass(frozen=True)
class AppState:
    """全域應用程式狀態 (Immutable)。"""
    current_locale: str = 'en_US'
    active_dataset_id: DatasetId | None = None
    theme: Literal['light', 'dark'] = 'light'
    recent_files: tuple[Path, ...] = ()

class StateManager:
    """狀態管理。"""
    def __init__(self, event_bus: EventBus) -> None:
        self._lock = threading.Lock()
        self._state = AppState()
        self._event_bus = event_bus

    def get_state(self) -> AppState:
        with self._lock:
            return self._state

    def update(self, **kwargs: Any) -> AppState:
        with self._lock:
            old_state = self._state
            self._state = replace(old_state, **kwargs)
            new_state = self._state
            
        logger.debug("狀態已更新。")
        self._event_bus.emit(StateChanged())
        return new_state

