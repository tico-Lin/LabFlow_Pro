import logging
from typing import Any

from PySide6.QtCore import QAbstractTableModel, QModelIndex, Qt

logger = logging.getLogger(__name__)

class DatasetTableModel(QAbstractTableModel):
    """
    資料集表格模型 (Dataset Table Model)

    作為 QTableView 的資料模型，直接與 HDF5 DatasetHandle 或 Numpy Array 整合。
    設計上支援延遲載入 (Lazy Loading) 來避免將全部資料載入記憶體。
    """

    def __init__(self, data_handle: Any, parent: Any = None) -> None:
        """
        初始化表格模型。
        """
        super().__init__(parent)
        self._data = data_handle
        
        # 判斷維度
        shape = self._data.shape if hasattr(self._data, 'shape') else (0,)
        if len(shape) == 1:
            self._rows = shape[0]
            self._cols = 1
        elif len(shape) >= 2:
            self._rows = shape[0]
            self._cols = shape[1]
        else:
            self._rows = 0
            self._cols = 0
            
        # 簡單的 Chunk Cache
        self._cache_row_start = -1
        self._cache_row_end = -1
        self._cache_data = None
        self._cache_size = 1000  # 每次快取 1000 筆

    def rowCount(self, parent=QModelIndex()):
        if parent.isValid():
            return 0
        return self._rows

    def columnCount(self, parent=QModelIndex()):
        if parent.isValid():
            return 0
        return self._cols

    def data(self, index, role=Qt.ItemDataRole.DisplayRole):
        if not index.isValid():
            return None

        if role == Qt.ItemDataRole.DisplayRole or role == Qt.ItemDataRole.EditRole:
            try:
                row = index.row()
                col = index.column()
                
                # Check cache
                if not (self._cache_row_start <= row < self._cache_row_end):
                    self._cache_row_start = row
                    self._cache_row_end = min(row + self._cache_size, self._rows)
                    if len(self._data.shape if hasattr(self._data, 'shape') else (0,)) == 1:
                        self._cache_data = self._data[self._cache_row_start:self._cache_row_end]
                    else:
                        self._cache_data = self._data[self._cache_row_start:self._cache_row_end, :]
                        
                # Read from cache
                cache_row = row - self._cache_row_start
                if len(self._data.shape if hasattr(self._data, 'shape') else (0,)) == 1:
                    val = self._cache_data[cache_row]
                else:
                    val = self._cache_data[cache_row, col]
                    
                return str(val) if val is not None else ""
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"讀取資料時發生錯誤 (row={row}, col={col}): {e}")
                return "Error"

        return None

    def headerData(self, section: int, orientation: Qt.Orientation, role: int = Qt.ItemDataRole.DisplayRole) -> Any:
        if role != Qt.ItemDataRole.DisplayRole:
            return None

        if orientation == Qt.Orientation.Horizontal:
            return f"Col {section}"
        elif orientation == Qt.Orientation.Vertical:
            return str(section + 1)
        
        return None
