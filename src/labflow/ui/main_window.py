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
        
        # 設定主要工具列 (Main Toolbar)
        from labflow.ui.widgets.toolbar import MainToolBar
        self.main_toolbar = MainToolBar(self)
        self.addToolBar(Qt.ToolBarArea.TopToolBarArea, self.main_toolbar)
        
        # 設定情境工具列 (Context Toolbars)
        from labflow.ui.widgets.context_toolbars import TextToolBar, TableToolBar
        self.text_toolbar = TextToolBar(self)
        self.table_toolbar = TableToolBar(self)
        self.addToolBar(Qt.ToolBarArea.TopToolBarArea, self.text_toolbar)
        self.addToolBar(Qt.ToolBarArea.TopToolBarArea, self.table_toolbar)
        self.text_toolbar.hide()
        self.table_toolbar.hide()
        
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
        self.menu_file.addAction(self.main_toolbar.action_import)
        self.menu_file.addSeparator()
        self.action_exit = self.menu_file.addAction("離開 (Exit)")
        self.action_exit.triggered.connect(self.close)
        
        # Analysis Menu
        self.action_shirley = self.menu_analysis.addAction(t("toolbar.analysis.shirley", default="Shirley 基線"))
        self.action_shirley.triggered.connect(lambda: self._trigger_analysis_from_toolbar('shirley_baseline'))
        
        self.action_smooth = self.menu_analysis.addAction(t("toolbar.analysis.smooth", default="S-G 平滑化"))
        self.action_smooth.triggered.connect(lambda: self._trigger_analysis_from_toolbar('savitzky_golay'))
        
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
        self.main_toolbar.action_import.triggered.connect(self._on_action_import)
        
        # Update Project Explorer with current DataStore
        if hasattr(self.project_explorer, '_tree_model') and hasattr(self.project_explorer._tree_model, 'update_data'):
            self.project_explorer._tree_model.update_data(self._kernel.get_data_store())
        
        # Connect dataset double click
        self.project_explorer.dataset_double_clicked.connect(self._on_dataset_double_clicked)
        self.project_explorer.dataset_plot_requested.connect(self._on_dataset_plot_requested)
        self.project_explorer.dataset_analysis_requested.connect(self._on_dataset_analysis_requested)
        
        # MDI Area events
        self.mdi_area.subWindowActivated.connect(self._on_subwindow_activated)

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

    def _on_subwindow_activated(self, sub_window):
        """當子視窗被啟動時，切換對應的情境工具列。"""
        self.text_toolbar.hide()
        self.table_toolbar.hide()
        
        if not sub_window:
            return
            
        widget = sub_window.widget()
        if widget is None: return
        
        from PySide6.QtWidgets import QTextEdit
        from labflow.ui.widgets.worksheet_widget import WorksheetWidget
        
        if isinstance(widget, QTextEdit):
            self.text_toolbar.set_editor(widget)
            self.text_toolbar.show()
        elif isinstance(widget, WorksheetWidget):
            self.table_toolbar.set_view(widget)
            self.table_toolbar.show()

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
            
            # Convert to float if it is a string array (e.g. from imported CSV)
            if data.dtype.kind in {'U', 'S', 'O'}:
                import pandas as pd
                df = pd.DataFrame(data)
                # Convert to numeric, coercing errors to NaN
                data = df.apply(pd.to_numeric, errors='coerce').to_numpy()
            
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
            
            # Convert to float if it is a string array (e.g. from imported CSV)
            if data.dtype.kind in {'U', 'S', 'O'}:
                import pandas as pd
                df = pd.DataFrame(data)
                # Convert to numeric, coercing errors to NaN
                data = df.apply(pd.to_numeric, errors='coerce').to_numpy()
                
            if len(shape) == 1:
                import numpy as np
                x = np.arange(shape[0])
                y = data
                canvas.add_plot(x, y, type=plot_type, name=path.split('/')[-1])
            elif len(shape) >= 2:
                x = data[:, 0]
                y = data[:, 1]
                # Filter out NaNs if any
                valid_mask = ~(np.isnan(x) | np.isnan(y))
                x = x[valid_mask]
                y = y[valid_mask]
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
            
            # Check type
            node_type = dataset.attrs.get('type', '')
            if isinstance(node_type, bytes):
                node_type = node_type.decode('utf-8')
                
            if node_type == 'text':
                from PySide6.QtWidgets import QTextEdit
                from PySide6.QtCore import QTimer
                import numpy as np
                
                # Read chunks to support partial lazy reading (just load all for now as string)
                data_array = dataset[:]
                text_content = "\n".join([line.decode('utf-8') if isinstance(line, bytes) else str(line) for line in data_array])
                
                view = QTextEdit()
                if text_content.strip().startswith('<!DOCTYPE HTML>') or text_content.strip().startswith('<html'):
                    view.setHtml(text_content)
                else:
                    view.setPlainText(text_content)
                
                # Debounced auto-save
                save_timer = QTimer(view)
                save_timer.setSingleShot(True)
                save_timer.setInterval(1000)  # 1 second debounce
                
                def _save_text():
                    try:
                        # Convert to HTML to preserve Rich Text formatting (bold, italic, etc)
                        lines = view.toHtml().split('\n')
                        dataset.resize((len(lines),))
                        dataset[:] = np.array(lines, dtype=object)
                    except Exception as e:
                        import logging
                        logging.getLogger(__name__).error(f"Save text failed: {e}")
                        
                save_timer.timeout.connect(_save_text)
                view.textChanged.connect(save_timer.start)
                
                sub = QMdiSubWindow()
                sub.setWidget(view)
                sub.setWindowTitle(path.split('/')[-1])
                sub.resize(600, 400)
                self.mdi_area.addSubWindow(sub)
                sub.show()
                return
                
            # 建立 WorksheetWidget 並設定資料模型 (Table + Formula Bar)
            from labflow.ui.widgets.worksheet_widget import WorksheetWidget
            widget = WorksheetWidget(self._kernel.get_event_bus(), self)
            model = DatasetTableModel(dataset, widget.view)
            widget.set_model(model)
            
            # 加入工作區 (QMdiArea)
            sub = QMdiSubWindow()
            sub.setWidget(widget)
            sub.setWindowTitle(path.split('/')[-1])
            sub.resize(600, 400)
            self.mdi_area.addSubWindow(sub)
            sub.show()
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to open dataset {path}: {e}")

    def _on_action_open(self) -> None:
        """開啟專案的動作 (未實作)"""
        from PySide6.QtWidgets import QMessageBox
        QMessageBox.information(self, "開啟舊檔", "開啟專案功能尚未完整實作，若要匯入資料請使用「資料 -> 匯入資料」。")

    def _on_action_import(self) -> None:
        """匯入檔案的動作"""
        from PySide6.QtWidgets import QFileDialog
        from PySide6.QtWidgets import QMessageBox
        import numpy as np
        
        file_path, _ = QFileDialog.getOpenFileName(
            self, t("dialog.import.title", default="匯入資料檔案 (Import Data)"), "", "Data Files (*.csv *.txt *.xls *.xlsx *.h5);;All Files (*)"
        )
        if not file_path:
            return
            
        try:
            store = self._kernel.get_data_store()
            import os
            
            if file_path.endswith('.txt'):
                name = os.path.basename(file_path).rsplit('.', 1)[0]
                try:
                    # Read as raw text lines (partial read/write supported via 1D chunking)
                    lines = []
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        for line in f:
                            lines.append(line.rstrip('\n'))
                            
                    import numpy as np
                    data = np.array(lines, dtype=object)
                    
                    import h5py
                    dt = h5py.string_dtype(encoding='utf-8')
                    
                    path_name = f"/Imported/{name}"
                    if path_name in store._file:
                        del store._file[path_name]
                        
                    ds = store._file.create_dataset(path_name, data=data, dtype=dt, maxshape=(None,))
                    ds.attrs['name'] = name.encode('utf-8')
                    ds.attrs['type'] = 'text'  # Mark as raw text
                    
                except Exception as e:
                    raise RuntimeError(f"無法解析純文字檔案: {e}")

            elif file_path.endswith('.csv') or file_path.endswith('.xls') or file_path.endswith('.xlsx'):
                name = os.path.basename(file_path).rsplit('.', 1)[0]
                
                try:
                    if file_path.endswith('.xls') or file_path.endswith('.xlsx'):
                        import pandas as pd
                        df = pd.read_excel(file_path, header=None, dtype=str)
                        data = df.fillna("").to_numpy(dtype=object)
                    else:
                        import csv
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            first_line = f.readline()
                            if '\t' in first_line: delim = '\t'
                            elif ',' in first_line: delim = ','
                            elif ';' in first_line: delim = ';'
                            else: delim = None
                        
                        rows = []
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            if delim is None:
                                for line in f:
                                    row = line.strip().split()
                                    if row: rows.append(row)
                            else:
                                reader = csv.reader(f, delimiter=delim)
                                for row in reader:
                                    if row: rows.append(row)
                                    
                        max_len = max((len(r) for r in rows), default=0)
                        padded_rows = []
                        for r in rows:
                            padded_rows.append(r + [""] * (max_len - len(r)))
                            
                        import numpy as np
                        data = np.array(padded_rows, dtype=object)
                    
                    import h5py
                    dt = h5py.string_dtype(encoding='utf-8')
                    
                    path_name = f"/Imported/{name}"
                    if path_name in store._file:
                        del store._file[path_name]
                        
                    ds = store._file.create_dataset(path_name, data=data, dtype=dt, maxshape=(None, None))
                    ds.attrs['name'] = name.encode('utf-8')
                    ds.attrs['type'] = 'matrix'  # Mark as table/matrix
                    
                except Exception as e:
                    raise RuntimeError(f"無法解析表格檔案: {e}")
                
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
