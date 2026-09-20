from PySide6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit, QMessageBox
from PySide6.QtCore import Qt

from labflow.ui.widgets.worksheet_view import WorksheetView
from labflow.core.formula import FormulaEngine
import numpy as np

class WorksheetWidget(QWidget):
    """
    包裝 WorksheetView 以及公式列 (Formula Bar) 的整合元件。
    """
    def __init__(self, event_bus, parent=None):
        super().__init__(parent)
        self._event_bus = event_bus
        self.view = WorksheetView(event_bus, self)
        
        self._setup_ui()
        
    def _setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(2)
        
        # Formula Bar
        formula_layout = QHBoxLayout()
        formula_layout.setContentsMargins(5, 5, 5, 5)
        
        fx_label = QLabel("<b><i>f(x)</i> =</b>")
        self.formula_input = QLineEdit()
        self.formula_input.setPlaceholderText("例如: Col(A) + sin(Col(B)[1]) ...")
        self.formula_input.returnPressed.connect(self._apply_formula)
        
        formula_layout.addWidget(fx_label)
        formula_layout.addWidget(self.formula_input)
        
        layout.addLayout(formula_layout)
        layout.addWidget(self.view)
        
    def set_model(self, model):
        self.view.set_model(model)
        
    def model(self):
        return self.view.model()
        
    def selectionModel(self):
        return self.view.selectionModel()
        
    def _apply_formula(self):
        expr = self.formula_input.text().strip()
        if not expr: return
        if expr.startswith("="):
            expr = expr[1:]
            
        model = self.model()
        if not model: return
        dataset = model._data # DatasetHandle
        
        # Get Selection
        selection = self.view.selectionModel()
        if not selection.hasSelection():
            QMessageBox.warning(self, "錯誤", "請先選取要填入結果的儲存格、欄或列。")
            return
            
        try:
            # 1. 計算公式結果
            result = FormulaEngine.evaluate(expr, dataset)
            
            # 2. 將結果轉成字串 (HDF5 是 string_dtype)
            if isinstance(result, np.ndarray):
                str_result = result.astype(str)
            else:
                str_result = str(result)
                
            # 3. 填入選取範圍 (優化效能：使用 ranges 而非 indexes)
            ranges = selection.selection()
            if not ranges: return
            
            min_row = min(r.top() for r in ranges)
            max_row = max(r.bottom() for r in ranges)
            min_col = min(r.left() for r in ranges)
            max_col = max(r.right() for r in ranges)
            
            row_count = max_row - min_row + 1
            col_count = max_col - min_col + 1
            
            # 若選取範圍大小和 result 大小一致，直接賦值
            # 否則 broadcast
            if isinstance(str_result, np.ndarray):
                if str_result.size == row_count * col_count:
                    str_result = str_result.reshape((row_count, col_count))
                elif str_result.size == row_count:
                    str_result = str_result.reshape((row_count, 1))
                elif str_result.size == col_count:
                    str_result = str_result.reshape((1, col_count))
                    
            dataset[min_row:max_row+1, min_col:max_col+1] = str_result
            
            # 清除快取並刷新 UI
            model._cache_data = None
            model._cache_row_start = -1
            model._cache_row_end = -1
            model.layoutChanged.emit()
            
        except Exception as e:
            QMessageBox.critical(self, "公式錯誤", f"無法計算公式:\n{e}")
