"""
狀態列模組。
提供主視窗的狀態列元件。
"""
import logging
from typing import Optional

from PySide6.QtWidgets import QStatusBar, QLabel, QProgressBar, QWidget

from labflow.i18n.translator import t, Translator

logger = logging.getLogger(__name__)

class MainStatusBar(QStatusBar):
    """主視窗的狀態列。"""

    def __init__(self, parent: Optional[QWidget] = None) -> None:
        """初始化狀態列。"""
        super().__init__(parent)
        
        self.ready_label = QLabel(self)
        self.addWidget(self.ready_label)
        
        self.progress_bar = QProgressBar(self)
        self.progress_bar.setVisible(False)
        self.progress_bar.setMaximumWidth(200)
        self.addPermanentWidget(self.progress_bar)
        
        try:
            translator = Translator.instance()
            if hasattr(translator, "locale_changed"):
                translator.locale_changed.connect(self.retranslate_ui)
        except Exception as e:
            logger.warning(f"Could not connect to Translator: {e}")
            
        self.retranslate_ui()

    def retranslate_ui(self) -> None:
        """重新翻譯 UI 文字。"""
        self.ready_label.setText(t("statusbar.ready", default="Ready"))
