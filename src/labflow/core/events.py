"""
系統事件定義，代表狀態已發生改變的通知。
"""
from dataclasses import dataclass, field
from typing import Literal
import time
from pathlib import Path
from .errors import LabFlowError

@dataclass(frozen=True)
class Event:
    """基礎事件。"""
    timestamp: float = field(default_factory=time.time, init=False)

@dataclass(frozen=True)
class DataChanged(Event):
    """資料變更事件。"""
    dataset_id: str
    change_type: Literal['created', 'modified', 'deleted']

@dataclass(frozen=True)
class ProjectOpened(Event):
    """專案已開啟。"""
    file_path: Path

@dataclass(frozen=True)
class ProjectClosed(Event):
    """專案已關閉。"""
    pass

@dataclass(frozen=True)
class ProjectSaved(Event):
    """專案已儲存。"""
    file_path: Path

@dataclass(frozen=True)
class LocaleChanged(Event):
    """系統語系已變更。"""
    old_locale: str
    new_locale: str

@dataclass(frozen=True)
class SelectionChanged(Event):
    """選取範圍已變更。"""
    dataset_id: str
    rows: list[int]
    cols: list[int]

@dataclass(frozen=True)
class ComputeCompleted(Event):
    """計算工作已完成。"""
    function_name: str
    source_id: str
    result_id: str

@dataclass(frozen=True)
class PluginLoaded(Event):
    """外掛模組已載入。"""
    plugin_name: str
    plugin_version: str

@dataclass(frozen=True)
class ErrorOccurred(Event):
    """系統發生錯誤。"""
    error: LabFlowError
    context: str

@dataclass(frozen=True)
class StateChanged(Event):
    """應用程式狀態已更新。"""
    pass
