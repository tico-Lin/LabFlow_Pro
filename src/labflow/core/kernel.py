"""
微內核 (Microkernel) 實作，負責初始化系統核心服務。
"""
import logging
from pathlib import Path
from .event_bus import EventBus
from .state import StateManager
from .config import AppConfig, load_config, get_default_config

logger = logging.getLogger(__name__)

class Kernel:
    """微內核，持有並管理 EventBus、StateManager 與 AppConfig。"""
    
    _instance = None
    
    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(Kernel, cls).__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        if not hasattr(self, '_initialized'):
            self._event_bus = EventBus()
            self._state_manager = StateManager(self._event_bus)
            self._config = get_default_config()
            self._initialized = True

    def boot(self, config_path: Path | None = None) -> None:
        """初始化服務並載入設定。"""
        if config_path:
            self._config = load_config(config_path)
            
        numeric_level = getattr(logging, self._config.log_level.upper(), logging.INFO)
        logging.basicConfig(level=numeric_level, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        
        logger.info("LabFlow Pro 微內核啟動完成。")

    def shutdown(self) -> None:
        """清理資源並關閉系統。"""
        logger.info("LabFlow Pro 微內核正在關閉。")
        # 清理操作可在此處擴充

    def get_event_bus(self) -> EventBus:
        """取得事件匯流排。"""
        return self._event_bus

    def get_state_manager(self) -> StateManager:
        """取得狀態管理器。"""
        return self._state_manager

    def get_config(self) -> AppConfig:
        """取得應用程式設定。"""
        return self._config

    def get_data_store(self):
        """取得資料儲存庫。"""
        if not hasattr(self, '_data_store'):
            import h5py
            import io
            from labflow.data.store import HDF5DataStore
            # Create an in-memory HDF5 file for testing
            self._h5_file = h5py.File(io.BytesIO(), 'w')
            self._data_store = HDF5DataStore(self._h5_file)
        return self._data_store
