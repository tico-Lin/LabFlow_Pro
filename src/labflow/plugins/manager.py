"""
插件管理員模組，負責動態載入與執行外部插件。
"""

import inspect
import importlib.util
import logging
from pathlib import Path
from typing import Dict, Any, Type

from labflow.plugins.base import Plugin

logger = logging.getLogger(__name__)

from labflow.api.context import LabFlowContext

class PluginManager:
    """
    插件管理員，負責掃描目錄、動態載入插件模組並提供執行方法。
    """
    
    def __init__(self, kernel: Any) -> None:
        """
        初始化插件管理員。
        
        :param kernel: 核心系統實例 (Kernel)
        """
        self._kernel = kernel
        self._plugins: Dict[str, Plugin] = {}

    def load_plugins(self, directory: Path | str) -> None:
        """
        掃描指定目錄，動態載入所有 Python 腳本中的插件。
        
        :param directory: 插件所在目錄
        """
        plugin_dir = Path(directory)
        if not plugin_dir.is_dir():
            logger.warning(f"插件目錄不存在: {plugin_dir}")
            return

        for filepath in plugin_dir.glob("*.py"):
            if filepath.name.startswith("__"):
                continue

            try:
                module_name = filepath.stem
                spec = importlib.util.spec_from_file_location(module_name, filepath)
                if spec is None or spec.loader is None:
                    logger.error(f"無法建立模組規格: {filepath}")
                    continue

                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)

                # 尋找模組中實作 Plugin 協議的類別
                for name, obj in inspect.getmembers(module, inspect.isclass):
                    if obj.__module__ == module_name and hasattr(obj, 'execute') and hasattr(obj, 'name'):
                        try:
                            # 實例化插件
                            plugin_instance = obj()
                            self._plugins[plugin_instance.name] = plugin_instance
                            logger.info(f"成功載入插件: {plugin_instance.name} (v{plugin_instance.version})")
                        except Exception as e:
                            logger.error(f"初始化插件 {name} 失敗: {e}", exc_info=True)

            except Exception as e:
                logger.error(f"載入插件檔案 {filepath} 時發生錯誤: {e}", exc_info=True)

    def execute_plugin(self, name: str) -> None:
        """
        執行指定名稱的插件。
        
        :param name: 插件名稱
        """
        if name not in self._plugins:
            logger.error(f"找不到指定的插件: {name}")
            return
            
        plugin = self._plugins[name]
        ctx = LabFlowContext(self._kernel)
        
        try:
            logger.info(f"開始執行插件: {name}")
            plugin.execute(ctx)
            logger.info(f"插件執行完畢: {name}")
        except Exception as e:
            logger.error(f"執行插件 {name} 時發生錯誤: {e}", exc_info=True)
