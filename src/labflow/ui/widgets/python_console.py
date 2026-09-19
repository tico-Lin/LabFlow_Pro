import sys
import code
import contextlib
import io
import logging
from typing import Any, Callable

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QPlainTextEdit, QPushButton, QHBoxLayout, QSplitter
)
from PySide6.QtCore import Qt, Signal, Slot
from PySide6.QtGui import QKeyEvent

try:
    from labflow.i18n.translator import t, Translator
except ImportError:
    # 建立一個簡單的替用方案以防依賴還未建立
    class DummyTranslator(QObject):
        locale_changed = Signal()
        @classmethod
        def instance(cls):
            if not hasattr(cls, "_instance"):
                cls._instance = cls()
            return cls._instance

    def t(key: str, default: str) -> str:
        return default
    Translator = DummyTranslator

logger = logging.getLogger(__name__)


class ConsoleInput(QPlainTextEdit):
    """
    Python 控制台輸入區域，支援 Shift+Enter 換行，Enter 執行，以及上下方向鍵歷史紀錄。
    """
    execute_requested = Signal(str)
    history_up = Signal()
    history_down = Signal()

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)

    def keyPressEvent(self, event: QKeyEvent) -> None:
        """
        處理鍵盤事件。
        """
        if event.key() in (Qt.Key.Key_Return, Qt.Key.Key_Enter):
            if event.modifiers() & Qt.KeyboardModifier.ShiftModifier:
                super().keyPressEvent(event)
            else:
                self.execute_requested.emit(self.toPlainText())
                event.accept()
        elif event.key() == Qt.Key.Key_Up:
            self.history_up.emit()
            event.accept()
        elif event.key() == Qt.Key.Key_Down:
            self.history_down.emit()
            event.accept()
        else:
            super().keyPressEvent(event)


class PythonConsole(QWidget):
    """
    Python 互動式控制台小工具，提供開發者與進階使用者的命令操作。
    """

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self._interpreter = code.InteractiveInterpreter()
        self._history: list[str] = []
        self._history_index: int = 0
        
        self._setup_ui()
        self._setup_i18n()

    def _setup_ui(self) -> None:
        """
        設定使用者介面與版面配置。
        """
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        
        self.output_area = QPlainTextEdit(self)
        self.output_area.setReadOnly(True)
        
        self.input_area = ConsoleInput(self)
        self.input_area.execute_requested.connect(self._execute_command)
        self.input_area.history_up.connect(self._history_up)
        self.input_area.history_down.connect(self._history_down)
        
        self.clear_button = QPushButton(self)
        self.clear_button.clicked.connect(self.clear_output)
        
        btn_layout = QHBoxLayout()
        btn_layout.addStretch()
        btn_layout.addWidget(self.clear_button)
        
        splitter = QSplitter(Qt.Orientation.Vertical)
        splitter.addWidget(self.output_area)
        splitter.addWidget(self.input_area)
        splitter.setStretchFactor(0, 3)
        splitter.setStretchFactor(1, 1)
        
        layout.addWidget(splitter)
        layout.addLayout(btn_layout)

    def _setup_i18n(self) -> None:
        """
        設定多國語言與事件連接。
        """
        try:
            translator = Translator.instance()
            translator.locale_changed.connect(self.update_translations)
        except Exception as e:
            logger.warning(f"無法連接 Translator: {e}")
            
        self.update_translations()

    @Slot()
    def update_translations(self) -> None:
        """
        更新介面文字。
        """
        self.input_area.setPlaceholderText(
            t("console.input_placeholder", default="請輸入 Python 程式碼 (Enter 執行, Shift+Enter 換行)")
        )
        self.clear_button.setText(
            t("console.clear_output", default="清除輸出")
        )

    def setup_environment(self, ctx: Any) -> None:
        """設定直譯器的環境變數。"""
        import numpy as np
        import scipy
        self._locals = {
            "ctx": ctx,
            "app": ctx,
            "np": np,
            "scipy": scipy
        }
        self._interpreter.locals.update(self._locals)
        logger.info("Python 控制台環境變數已更新。")

    @Slot()
    def clear_output(self) -> None:
        """
        清除輸出區域的內容。
        """
        self.output_area.clear()

    @Slot(str)
    def _execute_command(self, command: str) -> None:
        """
        執行輸入的命令並攔截輸出。
        """
        if not command.strip():
            return
            
        self._history.append(command)
        self._history_index = len(self._history)
        
        self._append_output(f">>> {command}\n")
        
        stdout_buf = io.StringIO()
        stderr_buf = io.StringIO()
        
        try:
            with contextlib.redirect_stdout(stdout_buf), contextlib.redirect_stderr(stderr_buf):
                self._interpreter.runsource(command)
        except Exception as e:
            stderr_buf.write(f"執行錯誤: {e}\n")
            logger.error(f"Console execution error: {e}", exc_info=True)
            
        out = stdout_buf.getvalue()
        err = stderr_buf.getvalue()
        
        if out:
            self._append_output(out)
        if err:
            self._append_output(err)
            
        self.input_area.clear()
        
        # 捲動到最底部
        scrollbar = self.output_area.verticalScrollBar()
        scrollbar.setValue(scrollbar.maximum())

    def _append_output(self, text: str) -> None:
        """
        附加文字至輸出區域。
        """
        self.output_area.insertPlainText(text)
        
    @Slot()
    def _history_up(self) -> None:
        """
        切換至上一個歷史指令。
        """
        if self._history and self._history_index > 0:
            self._history_index -= 1
            self.input_area.setPlainText(self._history[self._history_index])
            self._move_cursor_to_end()

    @Slot()
    def _history_down(self) -> None:
        """
        切換至下一個歷史指令或清空輸入框。
        """
        if self._history and self._history_index < len(self._history) - 1:
            self._history_index += 1
            self.input_area.setPlainText(self._history[self._history_index])
            self._move_cursor_to_end()
        elif self._history_index == len(self._history) - 1:
            self._history_index = len(self._history)
            self.input_area.clear()

    def _move_cursor_to_end(self) -> None:
        """
        將游標移動到輸入框文字最後方。
        """
        cursor = self.input_area.textCursor()
        cursor.movePosition(cursor.MoveOperation.End)
        self.input_area.setTextCursor(cursor)
