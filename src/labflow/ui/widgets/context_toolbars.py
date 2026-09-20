from PySide6.QtWidgets import QToolBar, QWidget
from PySide6.QtGui import QAction, QTextCharFormat, QFont
from PySide6.QtCore import Qt
from labflow.i18n.translator import t

class TextToolBar(QToolBar):
    def __init__(self, parent: QWidget = None):
        super().__init__(parent)
        self.setObjectName("TextToolBar")
        self.setWindowTitle(t("toolbar.text.title", default="文書處理 (Word)"))
        self.setMovable(False)
        
        self.action_bold = QAction(t("text.bold", default="粗體 (B)"), self)
        self.action_italic = QAction(t("text.italic", default="斜體 (I)"), self)
        self.action_underline = QAction(t("text.underline", default="底線 (U)"), self)
        
        self.addAction(self.action_bold)
        self.addAction(self.action_italic)
        self.addAction(self.action_underline)
        
        self.active_editor = None
        
        self.action_bold.triggered.connect(self._toggle_bold)
        self.action_italic.triggered.connect(self._toggle_italic)
        self.action_underline.triggered.connect(self._toggle_underline)

    def set_editor(self, editor):
        self.active_editor = editor

    def _toggle_bold(self):
        if not self.active_editor: return
        try:
            fmt = QTextCharFormat()
            # 取得目前的字體粗細
            current_weight = self.active_editor.fontWeight()
            new_weight = QFont.Normal if current_weight >= QFont.Bold else QFont.Bold
            fmt.setFontWeight(new_weight)
            self.active_editor.mergeCurrentCharFormat(fmt)
            self.active_editor.setFocus()
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Bold error: {e}")

    def _toggle_italic(self):
        if not self.active_editor: return
        try:
            fmt = QTextCharFormat()
            fmt.setFontItalic(not self.active_editor.fontItalic())
            self.active_editor.mergeCurrentCharFormat(fmt)
            self.active_editor.setFocus()
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Italic error: {e}")

    def _toggle_underline(self):
        if not self.active_editor: return
        try:
            fmt = QTextCharFormat()
            fmt.setFontUnderline(not self.active_editor.fontUnderline())
            self.active_editor.mergeCurrentCharFormat(fmt)
            self.active_editor.setFocus()
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Underline error: {e}")


class TableToolBar(QToolBar):
    def __init__(self, parent: QWidget = None):
        super().__init__(parent)
        self.setObjectName("TableToolBar")
        self.setWindowTitle(t("toolbar.table.title", default="資料處理 (Excel)"))
        self.setMovable(False)
        
        self.action_add_row = QAction(t("table.add_row", default="新增列 (+Row)"), self)
        self.action_add_col = QAction(t("table.add_col", default="新增欄 (+Col)"), self)
        self.action_del_row = QAction(t("table.del_row", default="刪除列 (-Row)"), self)
        self.action_del_col = QAction(t("table.del_col", default="刪除欄 (-Col)"), self)
        
        self.addAction(self.action_add_row)
        self.addAction(self.action_add_col)
        self.addAction(self.action_del_row)
        self.addAction(self.action_del_col)
        
        self.active_view = None
        
        self.action_add_row.triggered.connect(self._add_row)
        self.action_add_col.triggered.connect(self._add_col)
        self.action_del_row.triggered.connect(self._del_row)
        self.action_del_col.triggered.connect(self._del_col)

    def set_view(self, view):
        self.active_view = view

    def _add_row(self):
        if not self.active_view or not self.active_view.model(): return
        try:
            model = self.active_view.model()
            if hasattr(model, 'insertRow'):
                current_idx = self.active_view.selectionModel().currentIndex()
                if current_idx.isValid():
                    model.insertRow(current_idx.row() + 1)
                else:
                    model.insertRow(model.rowCount())
        except Exception as e:
            from PySide6.QtWidgets import QMessageBox
            QMessageBox.warning(self, "錯誤", f"無法新增列，可能是此資料表為舊版建立不支援動態縮放。\n詳細錯誤: {e}")

    def _add_col(self):
        if not self.active_view or not self.active_view.model(): return
        try:
            model = self.active_view.model()
            if hasattr(model, 'insertColumn'):
                current_idx = self.active_view.selectionModel().currentIndex()
                if current_idx.isValid():
                    model.insertColumn(current_idx.column() + 1)
                else:
                    model.insertColumn(model.columnCount())
        except Exception as e:
            from PySide6.QtWidgets import QMessageBox
            QMessageBox.warning(self, "錯誤", f"無法新增欄，可能是此資料表為舊版建立不支援動態縮放。\n詳細錯誤: {e}")

    def _del_row(self):
        if not self.active_view or not self.active_view.model(): return
        try:
            model = self.active_view.model()
            indexes = self.active_view.selectionModel().selectedRows()
            if indexes:
                for idx in reversed(sorted([i.row() for i in indexes])):
                    if hasattr(model, 'removeRow'): model.removeRow(idx)
            else:
                current_idx = self.active_view.selectionModel().currentIndex()
                if current_idx.isValid() and hasattr(model, 'removeRow'):
                    model.removeRow(current_idx.row())
                elif hasattr(model, 'removeRow') and model.rowCount() > 0:
                    model.removeRow(model.rowCount() - 1)
        except Exception as e:
            from PySide6.QtWidgets import QMessageBox
            QMessageBox.warning(self, "錯誤", f"刪除失敗: {e}")

    def _del_col(self):
        if not self.active_view or not self.active_view.model(): return
        try:
            model = self.active_view.model()
            indexes = self.active_view.selectionModel().selectedColumns()
            if indexes:
                for idx in reversed(sorted([i.column() for i in indexes])):
                    if hasattr(model, 'removeColumn'): model.removeColumn(idx)
            else:
                current_idx = self.active_view.selectionModel().currentIndex()
                if current_idx.isValid() and hasattr(model, 'removeColumn'):
                    model.removeColumn(current_idx.column())
                elif hasattr(model, 'removeColumn') and model.columnCount() > 0:
                    model.removeColumn(model.columnCount() - 1)
        except Exception as e:
            from PySide6.QtWidgets import QMessageBox
            QMessageBox.warning(self, "錯誤", f"刪除失敗: {e}")

