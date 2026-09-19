"""
主視窗模組。
負責管理應用程式的整體介面，包含選單、工具列、狀態列與停靠視窗。
"""
import logging
from typing import Optional

from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QMainWindow,
    QMdiArea,
    QDockWidget,
    QWidget,
    QMenu,
)

from labflow.i18n.translator import t, Translator
from .widgets.toolbar import MainToolBar
from .widgets.status_bar import MainStatusBar

try:
    from .widgets.project_explorer import ProjectExplorer
except ImportError:
    # 臨時的佔位元件
    class ProjectExplorer(QWidget):
        """專案瀏覽器佔位元件。"""
        def __init__(self, parent: Optional[QWidget] = None) -> None:
            super().__init__(parent)

logger = logging.getLogger(__name__)

class MainWindow(QMainWindow):
    """應用程式的主視窗。"""

    def __init__(self, parent: Optional[QWidget] = None) -> None:
        """初始化主視窗。"""
        super().__init__(parent)
        self.resize(1200, 800)
        
        self._init_ui()
        self._init_menus()
        
        # 連結翻譯器事件
        try:
            translator = Translator.instance()
            if hasattr(translator, "locale_changed"):
                translator.locale_changed.connect(self.retranslate_ui)
        except Exception as e:
            logger.warning(f"Could not connect to Translator: {e}")
            
        self.retranslate_ui()
        logger.info("MainWindow initialized.")

    def _init_ui(self) -> None:
        """初始化 UI 元件。"""
        # 中央區域
        self.mdi_area = QMdiArea(self)
        self.mdi_area.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
        self.mdi_area.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
        self.setCentralWidget(self.mdi_area)
        
        # 專案瀏覽器 (左側停靠視窗)
        self.dock_project = QDockWidget(self)
        self.dock_project.setAllowedAreas(Qt.DockWidgetArea.LeftDockWidgetArea | Qt.DockWidgetArea.RightDockWidgetArea)
        self.project_explorer = ProjectExplorer(self.dock_project)
        self.dock_project.setWidget(self.project_explorer)
        self.addDockWidget(Qt.DockWidgetArea.LeftDockWidgetArea, self.dock_project)
        
        # 狀態/日誌控制台 (底部停靠視窗)
        self.dock_console = QDockWidget(self)
        self.dock_console.setAllowedAreas(Qt.DockWidgetArea.BottomDockWidgetArea | Qt.DockWidgetArea.TopDockWidgetArea)
        
        try:
            from .widgets.python_console import PythonConsole
            # The app.py will inject the context later, or we can just instantiate it
            self.console_widget = PythonConsole(self.dock_console)
        except ImportError:
            self.console_widget = QWidget(self.dock_console) # 暫時用空白 QWidget 佔位
            
        self.dock_console.setWidget(self.console_widget)
        self.addDockWidget(Qt.DockWidgetArea.BottomDockWidgetArea, self.dock_console)
        
        # 工具列
        self.main_toolbar = MainToolBar(self)
        self.addToolBar(Qt.ToolBarArea.TopToolBarArea, self.main_toolbar)
        
        # 狀態列
        self.main_statusbar = MainStatusBar(self)
        self.setStatusBar(self.main_statusbar)

    def _init_menus(self) -> None:
        """初始化選單列。"""
        menubar = self.menuBar()
        
        self.menu_file = QMenu(menubar)
        self.menu_edit = QMenu(menubar)
        self.menu_view = QMenu(menubar)
        self.menu_data = QMenu(menubar)
        self.menu_analysis = QMenu(menubar)
        self.menu_graph = QMenu(menubar)
        self.menu_tools = QMenu(menubar)
        self.menu_help = QMenu(menubar)
        
        # File Menu
        self.menu_file.addAction(self.main_toolbar.action_new)
        self.menu_file.addAction(self.main_toolbar.action_open)
        self.menu_file.addAction(self.main_toolbar.action_save)
        self.menu_file.addSeparator()
        self.action_exit = self.menu_file.addAction("離開 (Exit)")
        self.action_exit.triggered.connect(self.close)
        
        # Analysis Menu
        self.menu_analysis.addAction(self.main_toolbar.action_shirley)
        self.menu_analysis.addAction(self.main_toolbar.action_smooth)
        
        # Graph Menu
        self.menu_graph.addAction("繪製線圖 (Line Plot)").triggered.connect(
            lambda: self._trigger_plot_from_menu('line')
        )
        self.menu_graph.addAction("繪製散佈圖 (Scatter Plot)").triggered.connect(
            lambda: self._trigger_plot_from_menu('scatter')
        )
        
        menubar.addMenu(self.menu_file)
        menubar.addMenu(self.menu_edit)
        menubar.addMenu(self.menu_view)
        menubar.addMenu(self.menu_data)
        menubar.addMenu(self.menu_analysis)
        menubar.addMenu(self.menu_graph)
        menubar.addMenu(self.menu_tools)
        menubar.addMenu(self.menu_help)

    def retranslate_ui(self) -> None:
        """重新翻譯 UI 文字。"""
        self.setWindowTitle(t("window.main.title", default="LabFlow Pro"))
        
        self.dock_project.setWindowTitle(t("dock.project_explorer.title", default="Project Explorer"))
        self.dock_console.setWindowTitle(t("dock.console.title", default="Status / Log Console"))
        
        self.menu_file.setTitle(t("menu.file.title", default="&File"))
        self.menu_edit.setTitle(t("menu.edit.title", default="&Edit"))
        self.menu_view.setTitle(t("menu.view.title", default="&View"))
        self.menu_data.setTitle(t("menu.data.title", default="&Data"))
        self.menu_analysis.setTitle(t("menu.analysis.title", default="&Analysis"))
        self.menu_graph.setTitle(t("menu.graph.title", default="&Graph"))
        self.menu_tools.setTitle(t("menu.tools.title", default="&Tools"))
        self.menu_help.setTitle(t("menu.help.title", default="&Help"))

    def setup(self, kernel) -> None:
        """注入 Kernel 並設定事件"""
        self._kernel = kernel
        self.main_toolbar.action_open.triggered.connect(self._on_action_open)
        
        self.main_toolbar.action_shirley.triggered.connect(
            lambda: self._trigger_analysis_from_toolbar('shirley_baseline')
        )
        self.main_toolbar.action_smooth.triggered.connect(
            lambda: self._trigger_analysis_from_toolbar('savitzky_golay')
        )
        
        # Update Project Explorer with current DataStore
        if hasattr(self.project_explorer, '_tree_model') and hasattr(self.project_explorer._tree_model, 'update_data'):
            self.project_explorer._tree_model.update_data(self._kernel.get_data_store())
        
        # Connect dataset double click
        self.project_explorer.dataset_double_clicked.connect(self._on_dataset_double_clicked)
        self.project_explorer.dataset_plot_requested.connect(self._on_dataset_plot_requested)
        self.project_explorer.dataset_analysis_requested.connect(self._on_dataset_analysis_requested)

    def _trigger_analysis_from_toolbar(self, analysis_name: str) -> None:
        """從頂部工具列觸發分析，取得目前選取的項目"""
        from PySide6.QtCore import Qt
        from PySide6.QtWidgets import QMessageBox
        
        indexes = self.project_explorer.selectedIndexes()
        if not indexes:
            QMessageBox.warning(self, "警告", "請先在左側專案管理員中選擇一個資料集！")
            return
            
        index = indexes[0]
        path = self.project_explorer._tree_model.data(index, Qt.ItemDataRole.UserRole)
        if not path:
            QMessageBox.warning(self, "警告", "請選擇一個有效的資料集節點！")
            return
            
        self._on_dataset_analysis_requested(path, analysis_name)

    def _trigger_plot_from_menu(self, plot_type: str) -> None:
        """從選單觸發繪圖"""
        from PySide6.QtCore import Qt
        from PySide6.QtWidgets import QMessageBox
        
        indexes = self.project_explorer.selectedIndexes()
        if not indexes:
            QMessageBox.warning(self, "警告", "請先在左側專案管理員中選擇一個資料集！")
            return
            
        index = indexes[0]
        path = self.project_explorer._tree_model.data(index, Qt.ItemDataRole.UserRole)
        if not path:
            QMessageBox.warning(self, "警告", "請選擇一個有效的資料集節點！")
            return
            
        self._on_dataset_plot_requested(path, plot_type)

    def _on_dataset_analysis_requested(self, path: str, analysis_name: str) -> None:
        """處理資料集分析請求"""
        try:
            store = self._kernel.get_data_store()
            dataset = store.get_dataset(path)
            data = dataset[:]
            
            # 使用 ComputeDispatcher 執行
            def on_analysis_done(future):
                try:
                    result = future.result()
                    # 儲存結果
                    new_path = f"{path}_{analysis_name}"
                    store.create_dataset(new_path, result.data)
                    self._kernel.event_bus.publish("ProjectStructureChanged", None)
                    
                    from PySide6.QtCore import QTimer
                    from PySide6.QtWidgets import QMessageBox
                    QTimer.singleShot(0, lambda: QMessageBox.information(self, "分析完成", f"分析完成，結果已儲存至 {new_path}"))
                except Exception as e:
                    from PySide6.QtCore import QTimer
                    from PySide6.QtWidgets import QMessageBox
                    QTimer.singleShot(0, lambda: QMessageBox.critical(self, "分析失敗", f"分析發生錯誤：{e}"))
                    
            from labflow.api.context import LabFlowContext
            ctx = LabFlowContext(self._kernel)
            # Submit to engine
            future = ctx.run_analysis(analysis_name, data)
            future.add_done_callback(on_analysis_done)
            
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to submit analysis {analysis_name} for {path}: {e}")

    def _on_dataset_plot_requested(self, path: str, plot_type: str) -> None:
        """處理資料集繪圖請求"""
        from labflow.ui.widgets.graph_canvas import GraphCanvas
        from PySide6.QtWidgets import QMdiSubWindow
        try:
            store = self._kernel.get_data_store()
            dataset = store.get_dataset(path)
            # 讀取資料
            data = dataset[:] 
            
            # 建立圖表
            canvas = GraphCanvas()
            
            # 簡單判斷，如果是 1D，y=data, x=arange。如果是 2D，x=col0, y=col1
            shape = data.shape if hasattr(data, 'shape') else (0,)
            if len(shape) == 1:
                import numpy as np
                x = np.arange(shape[0])
                y = data
                canvas.add_plot(x, y, type=plot_type, name=path.split('/')[-1])
            elif len(shape) >= 2:
                x = data[:, 0]
                y = data[:, 1]
                canvas.add_plot(x, y, type=plot_type, name=path.split('/')[-1])
            
            # 加入中央工作區
            sub = QMdiSubWindow()
            sub.setWidget(canvas)
            sub.setWindowTitle(f"Graph - {path.split('/')[-1]}")
            sub.resize(600, 400)
            self.mdi_area.addSubWindow(sub)
            sub.show()
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to plot dataset {path}: {e}")

    def _on_dataset_double_clicked(self, path: str) -> None:
        """處理資料集雙擊，於工作區開啟 WorksheetView"""
        from labflow.ui.widgets.worksheet_view import WorksheetView
        from labflow.ui.models.dataset_table_model import DatasetTableModel
        from PySide6.QtWidgets import QMdiSubWindow
        
        try:
            store = self._kernel.get_data_store()
            dataset = store.get_dataset(path)
            
            # 建立 WorksheetView 並設定資料模型
            view = WorksheetView(self._kernel.get_event_bus(), self)
            model = DatasetTableModel(dataset, view)
            view.set_model(model)
            
            # 加入中央工作區 (QMdiArea)
            sub = QMdiSubWindow()
            sub.setWidget(view)
            sub.setWindowTitle(path.split('/')[-1])
            sub.resize(600, 400)
            self.mdi_area.addSubWindow(sub)
            sub.show()
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to open dataset {path}: {e}")

    def _on_action_open(self) -> None:
        """開啟檔案的動作"""
        from PySide6.QtWidgets import QFileDialog
        from PySide6.QtWidgets import QMessageBox
        import numpy as np
        
        file_path, _ = QFileDialog.getOpenFileName(
            self, t("dialog.open.title", default="Open Data File"), "", "Data Files (*.csv *.h5);;All Files (*)"
        )
        if not file_path:
            return
            
        try:
            store = self._kernel.get_data_store()
            if file_path.endswith('.csv'):
                import os
                name = os.path.basename(file_path).replace('.csv', '')
                try:
                    # First try to load assuming no headers, or pandas if installed
                    try:
                        import pandas as pd
                        df = pd.read_csv(file_path)
                        data = df.to_numpy(dtype=np.float64, na_value=np.nan)
                    except ImportError:
                        data = np.loadtxt(file_path, delimiter=',')
                except ValueError:
                    # If ValueError occurs, likely there's a header string
                    try:
                        data = np.loadtxt(file_path, delimiter=',', skiprows=1)
                    except Exception as e:
                        # Fallback to genfromtxt which handles missing values
                        data = np.genfromtxt(file_path, delimiter=',', skip_header=1, filling_values=np.nan)
                
                store.create_dataset(f"/Imported/{name}", data)
            elif file_path.endswith('.h5'):
                import h5py
                def visit_func(name, node):
                    if isinstance(node, h5py.Dataset):
                        try:
                            # 讀取並儲存
                            data = node[:]
                            # 處理中文路徑 (避免編碼問題)
                            safe_name = name.encode('utf-8', 'ignore').decode('utf-8')
                            store.create_dataset(f"/Imported/{safe_name}", data)
                        except Exception as e:
                            import logging
                            logging.getLogger(__name__).warning(f"Failed to read dataset {name}: {e}")
                            
                with h5py.File(file_path, 'r') as f:
                    f.visititems(visit_func)
                        
            if hasattr(self.project_explorer, '_tree_model') and hasattr(self.project_explorer._tree_model, 'update_data'):
                self.project_explorer._tree_model.update_data(store)
                
            QMessageBox.information(self, "Success", f"Successfully imported {file_path}")
        except Exception as e:
            logger.error(f"Failed to load file {file_path}: {e}")
            from PySide6.QtWidgets import QMessageBox
            QMessageBox.critical(
                self, 
                t("dialog.error.title", default="匯入失敗"), 
                f"{t('dialog.error.file_load', default='檔案讀取時發生錯誤：')}\n{str(e)}\n\n"
                "提示：如果是 CSV 檔案，請確認檔案格式是否整齊（每行的欄位數量必須一致）。"
            )
