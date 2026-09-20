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
                    
                if isinstance(val, bytes):
                    return val.decode('utf-8')
                return str(val) if val is not None else ""
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"讀取資料時發生錯誤 (row={row}, col={col}): {e}")
                return "Error"

        return None

    def flags(self, index: QModelIndex) -> Qt.ItemFlag:
        if not index.isValid():
            return Qt.ItemFlag.NoItemFlags
        return Qt.ItemFlag.ItemIsSelectable | Qt.ItemFlag.ItemIsEnabled | Qt.ItemFlag.ItemIsEditable

    def setData(self, index: QModelIndex, value: Any, role: int = Qt.ItemDataRole.EditRole) -> bool:
        if index.isValid() and role == Qt.ItemDataRole.EditRole:
            try:
                row = index.row()
                col = index.column()
                
                if len(self._data.shape if hasattr(self._data, 'shape') else (0,)) == 1:
                    self._data[row] = str(value)
                else:
                    self._data[row, col] = str(value)
                    
                # Invalidate cache
                self._cache_data = None
                self._cache_row_start = -1
                self._cache_row_end = -1
                
                self.dataChanged.emit(index, index, [Qt.ItemDataRole.DisplayRole, Qt.ItemDataRole.EditRole])
                return True
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"寫入資料時發生錯誤 (row={index.row()}, col={index.column()}): {e}")
                return False
        return False

    def _clear_slice(self, args):
        """Helper to clear a slice based on dtype"""
        if self._data.dtype.kind in 'SUO':
            self._data[args] = ""
        else:
            self._data[args] = 0

    def insertRow(self, row: int, parent: QModelIndex = QModelIndex()) -> bool:
        if row < 0 or row > self._rows: return False
        self.beginInsertRows(parent, row, row)
        self._rows += 1
        if len(self._data.shape) >= 2:
            self._data.resize((self._rows, self._cols))
            # Shift down
            if row < self._rows - 1:
                for r in range(self._rows - 1, row, -1):
                    self._data[r, :] = self._data[r - 1, :]
            self._clear_slice((row, slice(None)))
        else:
            self._data.resize((self._rows,))
            if row < self._rows - 1:
                for r in range(self._rows - 1, row, -1):
                    self._data[r] = self._data[r - 1]
            self._clear_slice(row)
                
        self._cache_data = None
        self._cache_row_start = -1
        self._cache_row_end = -1
        self.endInsertRows()
        return True

    def insertColumn(self, column: int, parent: QModelIndex = QModelIndex()) -> bool:
        if len(self._data.shape) < 2: return False
        if column < 0 or column > self._cols: return False
        self.beginInsertColumns(parent, column, column)
        self._cols += 1
        self._data.resize((self._rows, self._cols))
        # Shift right
        if column < self._cols - 1:
            for c in range(self._cols - 1, column, -1):
                self._data[:, c] = self._data[:, c - 1]
        self._clear_slice((slice(None), column))
            
        self._cache_data = None
        self._cache_row_start = -1
        self._cache_row_end = -1
        self.endInsertColumns()
        return True

    def removeRow(self, row: int, parent: QModelIndex = QModelIndex()) -> bool:
        if row < 0 or row >= self._rows: return False
        self.beginRemoveRows(parent, row, row)
        # Shift data up
        import numpy as np
        if self._rows > 1:
            if len(self._data.shape) >= 2:
                for r in range(row, self._rows - 1):
                    self._data[r, :] = self._data[r + 1, :]
                self._data.resize((self._rows - 1, self._cols))
            else:
                for r in range(row, self._rows - 1):
                    self._data[r] = self._data[r + 1]
                self._data.resize((self._rows - 1,))
        self._rows -= 1
        self._cache_data = None
        self._cache_row_start = -1
        self._cache_row_end = -1
        self.endRemoveRows()
        return True

    def removeColumn(self, column: int, parent: QModelIndex = QModelIndex()) -> bool:
        if len(self._data.shape) < 2 or column < 0 or column >= self._cols: return False
        self.beginRemoveColumns(parent, column, column)
        if self._cols > 1:
            for c in range(column, self._cols - 1):
                self._data[:, c] = self._data[:, c + 1]
            self._data.resize((self._rows, self._cols - 1))
        self._cols -= 1
        self._cache_data = None
        self._cache_row_start = -1
        self._cache_row_end = -1
        self.endRemoveColumns()
        return True

    def _col_to_letter(self, col: int) -> str:
        letter = ""
        while col >= 0:
            letter = chr(65 + (col % 26)) + letter
            col = (col // 26) - 1
        return letter

    def headerData(self, section: int, orientation: Qt.Orientation, role: int = Qt.ItemDataRole.DisplayRole) -> Any:
        if role != Qt.ItemDataRole.DisplayRole:
            return None

        if orientation == Qt.Orientation.Horizontal:
            return self._col_to_letter(section)
        elif orientation == Qt.Orientation.Vertical:
            return str(section + 1)
        
        return None
