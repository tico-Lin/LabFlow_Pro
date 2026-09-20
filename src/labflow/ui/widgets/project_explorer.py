"""
專案總管元件模組。
提供 HDF5 檔案結構的樹狀檢視與互動功能。
"""
import logging
from typing import Optional, Any
from PySide6.QtWidgets import QTreeView, QMenu
from PySide6.QtCore import Signal, Qt, QModelIndex
from PySide6.QtGui import QAction

from labflow.ui.models.hdf5_tree_model import HDF5TreeModel
from labflow.i18n.translator import t, Translator

logger = logging.getLogger(__name__)

class ProjectExplorer(QTreeView):
    """
    專案總管視圖元件。
    顯示 HDF5 結構並提供右鍵選單等互動功能。
    """
    
    # 當使用者雙擊資料集時觸發，傳遞資料節點的絕對路徑
    dataset_double_clicked = Signal(str)
    dataset_plot_requested = Signal(str, str)
    dataset_analysis_requested = Signal(str, str) # path, analysis_name

    def __init__(self, parent: Optional[Any] = None) -> None:
        super().__init__(parent)
        self._tree_model = HDF5TreeModel(self)
        self.setModel(self._tree_model)
        
        self.setContextMenuPolicy(Qt.ContextMenuPolicy.CustomContextMenu)
        self.customContextMenuRequested.connect(self._show_context_menu)
        self.doubleClicked.connect(self._on_double_click)
        
        self._init_actions()
        
        # 註冊語系切換事件
        translator = Translator.instance()
        if hasattr(translator, "locale_changed"):
            translator.locale_changed.connect(self.retranslate_ui)

    def _init_actions(self) -> None:
        """初始化右鍵選單動作。"""
        self.action_open = QAction(self)
        self.action_rename = QAction(self)
        self.action_delete = QAction(self)
        self.action_properties = QAction(self)
        
        # 新增繪圖動作
        self.action_plot_line = QAction(self)
        self.action_plot_scatter = QAction(self)
        
        # 新增分析動作
        self.action_shirley_baseline = QAction(self)
        self.action_smooth_savgol = QAction(self)
        
        self.retranslate_ui()
        
    def retranslate_ui(self) -> None:
        """更新介面語言"""
        self.action_open.setText(t("project.open", default="開啟 (Open)"))
        self.action_rename.setText(t("project.rename", default="重新命名"))
        self.action_delete.setText(t("project.delete", default="刪除"))
        self.action_properties.setText(t("project.properties", default="屬性"))
        
        self.action_plot_line.setText(t("graph.line", default="繪製線圖"))
        self.action_plot_scatter.setText(t("graph.scatter", default="繪製散佈圖"))
        
        self.action_shirley_baseline.setText(t("analysis.baseline", default="基線扣除 (Shirley)"))
        self.action_smooth_savgol.setText(t("analysis.smooth", default="平滑化 (Savitzky-Golay)"))
        
        # 強制刷新模型標題
        self._tree_model.layoutChanged.emit()

    def _show_context_menu(self, position: Any) -> None:
        """
        顯示右鍵選單。
        """
        index: QModelIndex = self.indexAt(position)
        if not index.isValid():
            return
            
        menu = QMenu(self)
        menu.addAction(self.action_rename)
        menu.addAction(self.action_delete)
        menu.addSeparator()
        
        # 如果是 Dataset，加入繪圖與分析選單
        node_type = self._tree_model.data(index, Qt.ItemDataRole.UserRole + 1)
        path = self._tree_model.data(index, Qt.ItemDataRole.UserRole)
        if path:
            if node_type in ('dataset', 'matrix', 'text'):
                # Dataset (Worksheet/Text) can be opened
                menu.addAction(self.action_open)
                menu.addSeparator()
                
            if node_type in ('dataset', 'matrix'):
                plot_menu = menu.addMenu(t("graph.plot_type", default="繪圖類型"))
                plot_menu.addAction(self.action_plot_line)
                plot_menu.addAction(self.action_plot_scatter)
                
                analysis_menu = menu.addMenu(t("menu.analysis.title", default="資料分析"))
                analysis_menu.addAction(self.action_shirley_baseline)
                analysis_menu.addAction(self.action_smooth_savgol)
            
        menu.addSeparator()
        menu.addAction(self.action_properties)
        
        # 處理選單動作
        action = menu.exec(self.viewport().mapToGlobal(position))
        if action == self.action_open:
            if path and node_type in ('dataset', 'matrix', 'text'):
                self.dataset_double_clicked.emit(path)
        elif action == self.action_rename:
            self._handle_rename(index)
        elif action == self.action_delete:
            self._handle_delete(index)
        elif action == self.action_properties:
            self._handle_properties(index)
        elif action == self.action_plot_line:
            if path: self.dataset_plot_requested.emit(path, 'line')
        elif action == self.action_plot_scatter:
            if path: self.dataset_plot_requested.emit(path, 'scatter')
        elif action == self.action_shirley_baseline:
            if path: self.dataset_analysis_requested.emit(path, 'shirley_baseline')
        elif action == self.action_smooth_savgol:
            if path: self.dataset_analysis_requested.emit(path, 'savitzky_golay')

    def _on_double_click(self, index: QModelIndex) -> None:
        """
        處理雙擊事件。
        
        Args:
            index: 被雙擊的節點索引。
        """
        if not index.isValid():
            return
            
        path = self._tree_model.data(index, Qt.ItemDataRole.UserRole)
        node_type = self._tree_model.data(index, Qt.ItemDataRole.UserRole + 1)
        if path and node_type in ('dataset', 'matrix', 'text'):
            logger.info(f"Dataset double clicked: {path}")
            self.dataset_double_clicked.emit(path)

    def update_store(self, store: Any) -> None:
        """
        更新顯示的資料儲存。
        
        Args:
            store: DataStore 實例。
        """
        self._tree_model.update_data(store)
        self.expandAll()

    def _handle_rename(self, index: QModelIndex) -> None:
        """處理重新命名操作。"""
        path = self._tree_model.data(index, Qt.ItemDataRole.UserRole)
        logger.info(f"Rename requested for {path}")
        # 實際實作將由控制器處理

    def _handle_delete(self, index: QModelIndex) -> None:
        """處理刪除操作。"""
        path = self._tree_model.data(index, Qt.ItemDataRole.UserRole)
        logger.info(f"Delete requested for {path}")
        # 實際實作將由控制器處理

    def _handle_properties(self, index: QModelIndex) -> None:
        """處理屬性查看操作。"""
        path = self._tree_model.data(index, Qt.ItemDataRole.UserRole)
        logger.info(f"Properties requested for {path}")
        # 實際實作將由控制器處理
