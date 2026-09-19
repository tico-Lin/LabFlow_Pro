"""
系統設定檔載入與儲存 (TOML格式)。
"""
from dataclasses import dataclass, asdict
from pathlib import Path
import logging
try:
    import tomllib
except ImportError:
    try:
        import tomli as tomllib
    except ImportError:
        pass
try:
    import tomli_w
except ImportError:
    pass
from .errors import ConfigError

logger = logging.getLogger(__name__)

@dataclass
class AppConfig:
    """應用程式設定。"""
    locale: str
    theme: str
    recent_files_max: int
    chunk_size: int
    auto_save_interval: int
    plugin_dirs: list[str]
    log_level: str

def get_default_config() -> AppConfig:
    """取得預設設定。"""
    return AppConfig(
        locale='zh_TW',
        theme='light',
        recent_files_max=10,
        chunk_size=1024,
        auto_save_interval=300,
        plugin_dirs=['plugins'],
        log_level='INFO'
    )

def load_config(path: Path) -> AppConfig:
    """從 TOML 檔案載入設定。"""
    if not path.exists():
        logger.warning(f"設定檔不存在: {path}，將使用預設設定。")
        return get_default_config()
        
    try:
        with open(path, 'rb') as f:
            data = tomllib.load(f)
        return AppConfig(
            locale=data.get('app', {}).get('locale', 'zh_TW'),
            theme=data.get('app', {}).get('theme', 'light'),
            recent_files_max=data.get('app', {}).get('recent_files_max', 10),
            chunk_size=data.get('data', {}).get('chunk_size', 1024),
            auto_save_interval=data.get('performance', {}).get('auto_save_interval', 300),
            plugin_dirs=data.get('plugins', {}).get('dirs', ['plugins']),
            log_level=data.get('logging', {}).get('level', 'INFO')
        )
    except Exception as e:
        logger.error(f"讀取設定檔失敗: {path} - {e}")
        raise ConfigError(f"無法載入設定檔: {e}") from e

def save_config(config: AppConfig, path: Path) -> None:
    """儲存設定至 TOML 檔案。"""
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {
            'app': {
                'locale': config.locale,
                'theme': config.theme,
                'recent_files_max': config.recent_files_max
            },
            'data': {
                'chunk_size': config.chunk_size,
            },
            'performance': {
                'auto_save_interval': config.auto_save_interval,
            },
            'plugins': {
                'dirs': config.plugin_dirs,
            },
            'logging': {
                'level': config.log_level,
            }
        }
        with open(path, 'wb') as f:
            tomli_w.dump(data, f)
        logger.info(f"設定檔已儲存至: {path}")
    except Exception as e:
        logger.error(f"儲存設定檔失敗: {path} - {e}")
        raise ConfigError(f"無法儲存設定檔: {e}") from e
