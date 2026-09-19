"""
EventBus 單元測試。
測試事件訂閱、發佈及指令派發。
"""
import pytest
from unittest.mock import MagicMock

# 為了讓測試能運行，我們先實作一個簡單的 EventBus Dummy。
# 待專案實際實作時應從 labflow.core 匯入真實的 EventBus。
class DummyEventBus:
    def __init__(self):
        self._subscribers = {}
        self._command_handlers = {}
        
    def subscribe(self, event_type: str, handler: callable):
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(handler)
        
    def unsubscribe(self, event_type: str, handler: callable):
        if event_type in self._subscribers:
            self._subscribers[event_type].remove(handler)
            
    def emit(self, event_type: str, *args, **kwargs):
        for handler in self._subscribers.get(event_type, []):
            handler(*args, **kwargs)
            
    def register_command(self, cmd_type: str, handler: callable):
        self._command_handlers[cmd_type] = handler
        
    def dispatch_command(self, cmd_type: str, *args, **kwargs):
        if cmd_type not in self._command_handlers:
            raise ValueError(f"Unknown command: {cmd_type}")
        return self._command_handlers[cmd_type](*args, **kwargs)

@pytest.fixture
def event_bus():
    return DummyEventBus()

def test_subscribe_and_emit(event_bus):
    """測試訂閱與發佈事件。"""
    handler = MagicMock()
    event_bus.subscribe("data_loaded", handler)
    event_bus.emit("data_loaded", file_path="test.h5")
    handler.assert_called_once_with(file_path="test.h5")

def test_dispatch_command(event_bus):
    """測試派發指令。"""
    handler = MagicMock(return_value=True)
    event_bus.register_command("open_file", handler)
    result = event_bus.dispatch_command("open_file", path="test.h5")
    handler.assert_called_once_with(path="test.h5")
    assert result is True

def test_unsubscribe(event_bus):
    """測試取消訂閱事件後不會被呼叫。"""
    handler = MagicMock()
    event_bus.subscribe("data_loaded", handler)
    event_bus.unsubscribe("data_loaded", handler)
    event_bus.emit("data_loaded")
    handler.assert_not_called()

def test_multiple_subscribers(event_bus):
    """測試多個訂閱者同時收到事件。"""
    handler1 = MagicMock()
    handler2 = MagicMock()
    event_bus.subscribe("update", handler1)
    event_bus.subscribe("update", handler2)
    event_bus.emit("update")
    handler1.assert_called_once()
    handler2.assert_called_once()

def test_unknown_command(event_bus):
    """測試未知的指令派發應拋出錯誤。"""
    with pytest.raises(ValueError, match="Unknown command"):
        event_bus.dispatch_command("unknown_cmd")

def test_emit_with_no_subscribers(event_bus):
    """測試無訂閱者時發佈事件不會拋出錯誤。"""
    try:
        event_bus.emit("ghost_event")
    except Exception as e:
        pytest.fail(f"發佈未訂閱的事件時發生錯誤: {e}")
