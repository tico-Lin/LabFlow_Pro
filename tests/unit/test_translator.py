"""
Translator 單元測試。
測試多語系翻譯與替換功能。
"""
import pytest

# 簡單的 Dummy Translator
class DummyTranslator:
    def __init__(self):
        self._locale = "en_US"
        self._translations = {
            "en_US": {
                "hello": "Hello",
                "greeting": "Hello, {name}!"
            },
            "zh_TW": {
                "hello": "你好",
                "greeting": "你好，{name}！"
            }
        }
        
    def load_locale(self, locale: str):
        if locale not in self._translations:
            raise ValueError(f"Unknown locale: {locale}")
        self._locale = locale
        
    def t(self, key: str, **kwargs) -> str:
        # Fallback 邏輯
        text = self._translations.get(self._locale, {}).get(key)
        if text is None:
            text = self._translations.get("en_US", {}).get(key)
        if text is None:
            return key
        
        return text.format(**kwargs)
        
    @property
    def available_locales(self) -> list[str]:
        return list(self._translations.keys())

@pytest.fixture
def translator():
    return DummyTranslator()

def test_load_locale(translator):
    """測試載入語系。"""
    translator.load_locale("zh_TW")
    assert translator._locale == "zh_TW"

def test_translate_key(translator):
    """測試基本字串翻譯。"""
    translator.load_locale("en_US")
    assert translator.t("hello") == "Hello"
    translator.load_locale("zh_TW")
    assert translator.t("hello") == "你好"

def test_missing_key_fallback(translator):
    """測試缺少翻譯時退回 en_US 預設值 (此處模擬修改內部資料夾)。"""
    translator.load_locale("zh_TW")
    # 暫時移除 zh_TW 的 hello 翻譯
    del translator._translations["zh_TW"]["hello"]
    # 應該 fallback 到 en_US
    assert translator.t("hello") == "Hello"

def test_missing_key_returns_key(translator):
    """測試未知的鍵值直接回傳鍵值本身。"""
    assert translator.t("unknown.key") == "unknown.key"

def test_placeholder_interpolation(translator):
    """測試字串插值替換 ({name})。"""
    translator.load_locale("zh_TW")
    assert translator.t("greeting", name="LabFlow") == "你好，LabFlow！"

def test_switch_locale(translator):
    """測試切換語系後翻譯改變。"""
    translator.load_locale("en_US")
    en_greeting = translator.t("hello")
    translator.load_locale("zh_TW")
    zh_greeting = translator.t("hello")
    assert en_greeting == "Hello"
    assert zh_greeting == "你好"

def test_available_locales(translator):
    """測試取得可用語系清單。"""
    locales = translator.available_locales
    assert "en_US" in locales
    assert "zh_TW" in locales
