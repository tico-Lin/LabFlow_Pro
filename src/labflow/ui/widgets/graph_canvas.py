import logging
from typing import Any, Dict, List, Literal, Optional, Tuple, Union

import numpy as np
import pyqtgraph as pg
from PySide6.QtCore import Qt, QPointF
from PySide6.QtGui import QColor
from PySide6.QtWidgets import QWidget

logger = logging.getLogger(__name__)

class GraphCanvas(pg.GraphicsLayoutWidget):
    """
    LabFlow 繪圖畫布元件 (Layered Graphing)。
    
    提供類似 Origin 的圖層式繪圖功能，支援多個獨立 Y 軸但共用 X 軸的圖層。
    不包含資料處理邏輯，僅接受外部陣列進行繪圖以維持嚴格解耦。
    支援標準的互動工具 (平移、縮放、十字游標)。
    """

    def __init__(self, parent: Optional[QWidget] = None, **kwargs: Any) -> None:
        """初始化畫布，設定主圖層與互動游標。"""
        super().__init__(parent, **kwargs)
        self._setup_ui()
        
    def _setup_ui(self) -> None:
        """初始化主要圖層 (Layer 0) 與十字游標。"""
        self.setBackground('w')  # 預設背景設為白色
        
        # 主圖層 (Layer 0)
        self.main_plot: pg.PlotItem = self.addPlot()
        self.main_plot.setLabel('bottom', "X Axis")
        self.main_plot.setLabel('left', "Y Axis 1")
        self.main_plot.showGrid(x=True, y=True, alpha=0.3)
        
        # 圖層管理器
        self.layers: List[pg.ViewBox] = [self.main_plot.vb]
        self.axes: List[pg.AxisItem] = [self.main_plot.getAxis('left')]
        
        # 建立十字游標 (Crosshair)
        self.v_line = pg.InfiniteLine(angle=90, movable=False, pen=pg.mkPen(color='gray', style=Qt.PenStyle.DashLine))
        self.h_line = pg.InfiniteLine(angle=0, movable=False, pen=pg.mkPen(color='gray', style=Qt.PenStyle.DashLine))
        self.main_plot.addItem(self.v_line, ignoreBounds=True)
        self.main_plot.addItem(self.h_line, ignoreBounds=True)
        
        # 綁定滑鼠事件以更新十字游標
        self.proxy = pg.SignalProxy(self.scene().sigMouseMoved, rateLimit=60, slot=self._mouse_moved)

    def _mouse_moved(self, evt: Tuple[QPointF]) -> None:
        """處理滑鼠移動事件，即時更新十字游標位置。"""
        try:
            pos = evt[0]
            if self.main_plot.sceneBoundingRect().contains(pos):
                mouse_point = self.main_plot.vb.mapSceneToView(pos)
                self.v_line.setPos(mouse_point.x())
                self.h_line.setPos(mouse_point.y())
        except Exception as e:
            logger.debug(f"更新十字游標失敗: {e}")

    def add_layer(self, y_axis_label: str = "Right") -> int:
        """
        新增一個圖層 (共用 X 軸，擁有獨立的 Y 軸)。
        
        :param y_axis_label: 新 Y 軸的標籤名稱
        :return: 新圖層的索引值 (Layer ID)
        """
        layer_id = len(self.layers)
        
        if layer_id == 1:
            # 第一個附加圖層：使用預設的右側 Y 軸
            new_viewbox = pg.ViewBox()
            self.main_plot.scene().addItem(new_viewbox)
            self.main_plot.showAxis('right')
            right_axis = self.main_plot.getAxis('right')
            right_axis.linkToView(new_viewbox)
            right_axis.setLabel(y_axis_label)
            
            # 共用主圖層的 X 軸
            new_viewbox.setXLink(self.main_plot)
            self.layers.append(new_viewbox)
            self.axes.append(right_axis)
            
            # 確保縮放時 ViewBox 同步變更
            def update_views() -> None:
                new_viewbox.setGeometry(self.main_plot.vb.sceneBoundingRect())
                new_viewbox.linkedViewChanged(self.main_plot.vb, new_viewbox.XAxis)
                
            self.main_plot.vb.sigResized.connect(update_views)
            update_views()
            logger.info(f"已新增右側 Y 軸圖層 (Layer {layer_id}).")
            
        else:
            # 對於第 3 個以上的圖層，需要更進階的版面配置。
            # 在此實作基礎的視窗覆蓋模式。
            logger.warning("新增超過 2 個 Y 軸需要進階排版設定，在此採用預設覆蓋模式。")
            new_viewbox = pg.ViewBox()
            self.main_plot.scene().addItem(new_viewbox)
            
            new_viewbox.setXLink(self.main_plot)
            self.layers.append(new_viewbox)
            logger.info(f"已新增疊加圖層 (Layer {layer_id}).")

        return layer_id

    def add_plot(self, 
                 x_data: Union[np.ndarray, List[float]], 
                 y_data: Union[np.ndarray, List[float]], 
                 type: Literal['line', 'scatter'] = 'line', 
                 layer: int = 0, 
                 color: str = 'red') -> pg.GraphicsObject:
        """
        在指定的圖層上繪製資料，嚴格解耦，僅負責顯示。
        
        :param x_data: X 軸數值資料
        :param y_data: Y 軸數值資料
        :param type: 繪圖類型 ('line' 或 'scatter')
        :param layer: 目標圖層索引 (0 為主圖層)
        :param color: 繪圖顏色
        :return: 新增的 pyqtgraph 繪圖物件
        :raises ValueError: 當圖層索引無效或繪圖類型不支援時拋出
        """
        try:
            if layer < 0 or layer >= len(self.layers):
                raise ValueError(f"無效的圖層索引：{layer}")

            x = np.asarray(x_data)
            y = np.asarray(y_data)
            
            pen = pg.mkPen(color=color, width=2) if type == 'line' else None
            brush = pg.mkBrush(color=color) if type == 'scatter' else None

            if type == 'line':
                item = pg.PlotDataItem(x, y, pen=pen)
            elif type == 'scatter':
                item = pg.ScatterPlotItem(x, y, pen=None, brush=brush, size=7)
            else:
                raise ValueError(f"不支援的繪圖類型：{type}")

            viewbox = self.layers[layer]
            viewbox.addItem(item)
            
            logger.info(f"已於 Layer {layer} 繪製 {type}，顏色: {color}.")
            return item
            
        except Exception as e:
            logger.error(f"繪圖失敗: {e}")
            raise

    def clear_plots(self, layer: Optional[int] = None) -> None:
        """
        清除圖層上的資料。
        
        :param layer: 指定要清除的圖層索引，若為 None 則清除所有圖層
        """
        if layer is None:
            for vb in self.layers:
                vb.clear()
            logger.info("已清除所有圖層繪圖資料。")
        else:
            if 0 <= layer < len(self.layers):
                self.layers[layer].clear()
                logger.info(f"已清除圖層 {layer} 的資料。")
            else:
                logger.error(f"無法清除無效的圖層: {layer}")
