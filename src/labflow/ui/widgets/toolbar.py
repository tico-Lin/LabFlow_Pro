"""
工具列模組。
提供主視窗的主要工具列元件。
"""
import logging
from typing import Optional

from PySide6.QtGui import QAction
from PySide6.QtWidgets import QToolBar, QWidget

from labflow.i18n.translator import t, Translator

logger = logging.getLogger(__name__)

class MainToolBar(QToolBar):
    """主視窗的工具列。"""

    def __init__(self, parent: Optional[QWidget] = None) -> None:
        """初始化工具列。"""
        super().__init__(parent)
        self.setObjectName("MainToolBar")
        self.setMovable(False)
        
        self._init_actions()
        
        try:
            translator = Translator.instance()
            if hasattr(translator, "locale_changed"):
                translator.locale_changed.connect(self.retranslate_ui)
        except Exception as e:
            logger.warning(f"Could not connect to Translator: {e}")
            
        self.retranslate_ui()

    def _init_actions(self) -> None:
        """初始化工具列動作。"""
        self.action_new = QAction(self)
        self.action_open = QAction(self)
        self.action_save = QAction(self)
        
        self.action_shirley = QAction(self)
        self.action_smooth = QAction(self)
        
        self.addAction(self.action_new)
        self.addAction(self.action_open)
        self.addAction(self.action_save)
        
        self.addSeparator()
        self.addAction(self.action_shirley)
        self.addAction(self.action_smooth)

    def retranslate_ui(self) -> None:
        """重新翻譯 UI 文字。"""
        self.setWindowTitle(t("toolbar.main.title", default="主要工具列"))
        
        self.action_new.setText(t("menu.file.new_project", default="開新專案"))
        self.action_new.setToolTip(t("tooltip.new_project", default="建立新專案"))
        
        self.action_open.setText(t("menu.file.open_project", default="開啟舊檔"))
        self.action_open.setToolTip(t("tooltip.open_project", default="開啟舊檔"))
        
        self.action_save.setText(t("menu.file.save_project", default="儲存專案"))
        self.action_save.setToolTip(t("tooltip.save_project", default="儲存目前專案"))
        
        self.action_shirley.setText(t("toolbar.analysis.shirley", default="Shirley 基線"))
        self.action_shirley.setToolTip(t("tooltip.analysis.shirley", default="對選取資料進行 Shirley 基線扣除"))
        
        self.action_smooth.setText(t("toolbar.analysis.smooth", default="S-G 平滑化"))
        self.action_smooth.setToolTip(t("tooltip.analysis.smooth", default="對選取資料進行 Savitzky-Golay 平滑化"))
