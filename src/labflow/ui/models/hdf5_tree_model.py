"""
HDF5 樹狀模型模組。
提供將 HDF5 階層結構映射至 Qt 視圖的資料模型。
"""
import logging
from typing import Any, Optional, Dict, List
from PySide6.QtCore import QAbstractItemModel, QModelIndex, Qt
from labflow.data.store import DataStore
from labflow.i18n.translator import t

logger = logging.getLogger(__name__)

class HDF5Node:
    """HDF5 節點類別，用於構建樹狀結構。"""
    def __init__(self, name: str, node_type: str, path: str, parent: Optional['HDF5Node'] = None):
        self.name: str = name
        self.node_type: str = node_type
        self.path: str = path
        self.parent_item: Optional['HDF5Node'] = parent
        self.child_items: List['HDF5Node'] = []

    def append_child(self, child: 'HDF5Node') -> None:
        """加入子節點。"""
        self.child_items.append(child)

    def child(self, row: int) -> Optional['HDF5Node']:
        """取得指定列的子節點。"""
        if 0 <= row < len(self.child_items):
            return self.child_items[row]
        return None

    def child_count(self) -> int:
        """取得子節點數量。"""
        return len(self.child_items)

    def column_count(self) -> int:
        """取得欄位數量（名稱與類型）。"""
        return 2

    def data(self, column: int) -> Any:
        """取得欄位資料。"""
        if column == 0:
            return self.name
        elif column == 1:
            return self.node_type
        return None

    def row(self) -> int:
        """取得本節點在父節點中的列索引。"""
        if self.parent_item:
            return self.parent_item.child_items.index(self)
        return 0

class HDF5TreeModel(QAbstractItemModel):
    """
    HDF5 樹狀資料模型，用於 QTreeView 顯示。
    """
    def __init__(self, parent: Optional[Any] = None) -> None:
        self._root_item = HDF5Node("Root", "root", "/")
        super().__init__(parent)

    def update_data(self, store: DataStore) -> None:
        """
        根據 HDF5 資料儲存更新模型。
        
        Args:
            store: DataStore 實例。
        """
        self.beginResetModel()
        self._root_item = HDF5Node(t("project_root"), "root", "/")
        try:
            tree_data = store.get_node_tree()
            self._build_tree(tree_data, self._root_item)
        except Exception as e:
            logger.error(f"Failed to update HDF5 tree data: {e}")
        finally:
            self.endResetModel()

    def _build_tree(self, data: Dict[str, Any], parent_node: HDF5Node) -> None:
        """遞迴構建樹狀結構。"""
        for name, info in data.items():
            path = info.get("path", "")
            node_type = info.get("type", "unknown")
            child_node = HDF5Node(name, node_type, path, parent_node)
            parent_node.append_child(child_node)
            
            children = info.get("children")
            if children and isinstance(children, dict):
                self._build_tree(children, child_node)

    def index(self, row, column, parent=None):
        """建立索引。"""
        parent = parent or QModelIndex()
        if not self.hasIndex(row, column, parent):
            return QModelIndex()

        if not parent.isValid():
            parent_item = self._root_item
        else:
            parent_item = parent.internalPointer()

        child_item = parent_item.child(row)
        if child_item:
            return self.createIndex(row, column, child_item)
        return QModelIndex()

    def parent(self, index):
        """取得父節點索引。"""
        if not index.isValid():
            return QModelIndex()

        child_item = index.internalPointer()
        parent_item = child_item.parent_item

        if parent_item == self._root_item or parent_item is None:
            return QModelIndex()

        return self.createIndex(parent_item.row(), 0, parent_item)

    def rowCount(self, parent=None):
        """取得列數。"""
        parent = parent or QModelIndex()
        if parent.column() > 0:
            return 0

        if not parent.isValid():
            parent_item = self._root_item
        else:
            parent_item = parent.internalPointer()

        return parent_item.child_count()

    def columnCount(self, parent=None):
        """取得欄數。"""
        parent = parent or QModelIndex()
        if parent.isValid():
            return parent.internalPointer().column_count()
        return self._root_item.column_count()

    def data(self, index, role=Qt.ItemDataRole.DisplayRole):
        """取得顯示資料。"""
        if not index.isValid():
            return None

        if role == Qt.ItemDataRole.DisplayRole:
            item = index.internalPointer()
            return item.data(index.column())
            
        if role == Qt.ItemDataRole.ToolTipRole:
            item = index.internalPointer()
            return f"路徑 (Path): {item.path}\n類型 (Type): {item.node_type}\n雙擊開啟 (Double-click to open)"
        
        if role == Qt.ItemDataRole.UserRole:
            item = index.internalPointer()
            return item.path
            
        return None

    def headerData(self, section: int, orientation: Qt.Orientation, role: int = Qt.ItemDataRole.DisplayRole) -> Any:
        """取得標題資料。"""
        if orientation == Qt.Orientation.Horizontal and role == Qt.ItemDataRole.DisplayRole:
            if section == 0:
                return t("worksheet.column_name", default="名稱")
            elif section == 1:
                return t("worksheet.column_type", default="類型")
        return None
