import logging
from typing import Any

from PySide6.QtWidgets import QTableView, QHeaderView
from PySide6.QtCore import Slot

from labflow.ui.models.dataset_table_model import DatasetTableModel
from labflow.ui.delegates.cell_delegate import CellDelegate
from labflow.core.events import EventBus, DataChangedEvent

logger = logging.getLogger(__name__)

class WorksheetView(QTableView):
    """
    工作表檢視元件 (Worksheet View)

    自訂的電子表格外觀，支援凍結表頭、網格線以及巨量資料的延遲載入顯示。
    """

    def __init__(self, event_bus: EventBus, parent: Any = None) -> None:
        """
        初始化工作表檢視。

        Args:
            event_bus (EventBus): 事件匯流排，用於監聽資料變更。
            parent (Any, optional): 父元件。
        """
        super().__init__(parent)
        self._event_bus = event_bus
        self._current_worksheet_id: str | None = None
        
        self._setup_ui()
        self._subscribe_events()

    def _setup_ui(self) -> None:
        """
        設定檢視外觀與行為。
        """
        self.setAlternatingRowColors(True)
        self.setShowGrid(True)
        self.setCornerButtonEnabled(False)
        
        # 設定 CellDelegate 處理高效能數值渲染
        self.setItemDelegate(CellDelegate(self))

        # 設定表頭
        horizontal_header = self.horizontalHeader()
        if horizontal_header:
            horizontal_header.setSectionResizeMode(QHeaderView.ResizeMode.Interactive)
            horizontal_header.setStretchLastSection(True)

        vertical_header = self.verticalHeader()
        if vertical_header:
            vertical_header.setSectionResizeMode(QHeaderView.ResizeMode.Fixed)
            vertical_header.setDefaultSectionSize(25)

    def _subscribe_events(self) -> None:
        """
        訂閱 EventBus 事件。
        """
        try:
            self._event_bus.subscribe(DataChangedEvent, self._on_data_changed)
        except Exception as e:
            logger.error(f"訂閱事件失敗: {e}")

    def set_model(self, model: DatasetTableModel) -> None:
        """
        設定資料模型。

        Args:
            model (DatasetTableModel): 資料模型。
        """
        self.setModel(model)
        if hasattr(model._worksheet, 'id'):
            self._current_worksheet_id = model._worksheet.id

    @Slot(DataChangedEvent)
    def _on_data_changed(self, event: DataChangedEvent) -> None:
        """
        處理資料變更事件。

        Args:
            event (DataChangedEvent): 資料變更事件物件。
        """
        if not self.model():
            return
            
        if self._current_worksheet_id and event.worksheet_id == self._current_worksheet_id:
            logger.debug(f"收到工作表 {event.worksheet_id} 資料變更事件，更新檢視")
            # 觸發整個檢視更新 (可用更精細的 dataChanged 如果事件提供座標)
            self.model().layoutChanged.emit()
