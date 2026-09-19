import json
import logging
import threading
from pathlib import Path
from typing import Any, Dict, List, Optional

from PySide6.QtCore import QObject, Signal

logger = logging.getLogger(__name__)

class Translator(QObject):
    """國際化翻譯器 — 支援即時語言切換的單例模式翻譯引擎。"""
    
    locale_changed = Signal(str, str)  # old_locale, new_locale
    
    _instance: Optional['Translator'] = None
    _lock = threading.RLock()

    def __init__(self) -> None:
        super().__init__()
        self._current_locale: str = "en_US"
        
        import sys
        if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
            self._locales_dir = Path(sys._MEIPASS) / "locales"
        else:
            self._locales_dir = Path("locales")
        self._translations: Dict[str, Any] = {}
        self._fallback_translations: Dict[str, Any] = {}
        self._load_fallback()
        self.load_locale(self._current_locale)

    @classmethod
    def instance(cls) -> 'Translator':
        """取得翻譯器單例。"""
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls()
            return cls._instance

    @classmethod
    def _reset(cls) -> None:
        """重設單例，主要用於測試。"""
        with cls._lock:
            if cls._instance is not None:
                cls._instance.deleteLater()
                cls._instance = None

    def _load_fallback(self) -> None:
        """載入後備語言（英文）。"""
        fallback_path = self._locales_dir / "en_US.json"
        if fallback_path.exists():
            try:
                with open(fallback_path, "r", encoding="utf-8") as f:
                    self._fallback_translations = json.load(f)
            except Exception as e:
                logger.error(f"載入後備語言 (en_US) 失敗: {e}")
        else:
            logger.warning("找不到後備語言檔案 (en_US.json)")

    def load_locale(self, locale: str) -> None:
        """載入指定語言檔案。"""
        path = self._locales_dir / f"{locale}.json"
        if not path.exists():
            logger.warning(f"找不到語言檔案: {path}")
            return
        
        try:
            with open(path, "r", encoding="utf-8") as f:
                self._translations = json.load(f)
        except Exception as e:
            logger.error(f"載入語言檔案 {locale} 失敗: {e}")

    def set_locale(self, locale: str) -> None:
        """切換目前語言，並發出 locale_changed 訊號。"""
        with self._lock:
            if locale == self._current_locale:
                return
            old_locale = self._current_locale
            self.load_locale(locale)
            self._current_locale = locale
            self.locale_changed.emit(old_locale, locale)
            logger.info(f"切換語言: {old_locale} -> {locale}")

    def get_locale(self) -> str:
        """取得目前使用的語言代碼。"""
        with self._lock:
            return self._current_locale

    def get_available_locales(self) -> List[str]:
        """取得可用的語言列表。"""
        if not self._locales_dir.exists():
            return []
        return sorted([f.stem for f in self._locales_dir.glob("*.json")])

    def _get_nested_value(self, d: Dict[str, Any], keys: List[str]) -> Optional[Any]:
        """遞迴取得字典中的巢狀值。"""
        for key in keys:
            if isinstance(d, dict) and key in d:
                d = d[key]
            else:
                return None
        return d

    def t(self, key: str, **kwargs: Any) -> str:
        """
        翻譯指定的鍵值，支援點號分隔的多層級結構及字串格式化。
        若找不到對應翻譯，將嘗試使用後備語言；若仍找不到則回傳鍵值本身。
        """
        keys = key.split('.')
        with self._lock:
            # 嘗試目前語言
            val = self._get_nested_value(self._translations, keys)
            if val is not None and isinstance(val, str):
                return val.format(**kwargs) if kwargs else val
            
            # 嘗試後備語言
            val = self._get_nested_value(self._fallback_translations, keys)
            if val is not None and isinstance(val, str):
                return val.format(**kwargs) if kwargs else val
            
            if 'default' in kwargs:
                default_val = kwargs.pop('default')
                # If there are still format arguments, format the default string
                if kwargs and isinstance(default_val, str):
                    try:
                        return default_val.format(**kwargs)
                    except KeyError:
                        return default_val
                return default_val
                
            logger.warning(f"找不到翻譯鍵值: {key}")
            return key


def t(key: str, **kwargs: Any) -> str:
    """快捷翻譯函式。"""
    return Translator.instance().t(key, **kwargs)

def get_translator() -> Translator:
    """取得翻譯器單例。"""
    return Translator.instance()
