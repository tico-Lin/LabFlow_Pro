"""
LabFlow Pro 核心模組 (Core Module)。
包含系統的基礎型別、錯誤定義、事件、事件匯流排、設定及微內核。
"""
from .types import DatasetId, NodePath, ColumnSpec, AxisRange, ComputeResult
from .errors import (
    LabFlowError, DataStoreError, DatasetNotFoundError, SchemaValidationError,
    ProjectFileError, PluginError, TranslationError, ConfigError, ComputeError
)
from .events import (
    Event, DataChanged, ProjectOpened, ProjectClosed, ProjectSaved,
    LocaleChanged, SelectionChanged, ComputeCompleted, PluginLoaded, ErrorOccurred, StateChanged
)
from .event_bus import EventBus
from .config import AppConfig, load_config, save_config, get_default_config
from .kernel import Kernel

__all__ = [
    'DatasetId', 'NodePath', 'ColumnSpec', 'AxisRange', 'ComputeResult',
    'LabFlowError', 'DataStoreError', 'DatasetNotFoundError', 'SchemaValidationError',
    'ProjectFileError', 'PluginError', 'TranslationError', 'ConfigError', 'ComputeError',
    'Event', 'DataChanged', 'ProjectOpened', 'ProjectClosed', 'ProjectSaved',
    'LocaleChanged', 'SelectionChanged', 'ComputeCompleted', 'PluginLoaded', 'ErrorOccurred', 'StateChanged',
    'EventBus', 'AppConfig', 'load_config', 'save_config', 'get_default_config', 'Kernel'
]
