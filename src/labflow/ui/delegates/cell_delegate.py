import logging
from typing import Any

from PySide6.QtWidgets import QStyledItemDelegate, QStyleOptionViewItem
from PySide6.QtCore import QModelIndex, Qt
from PySide6.QtGui import QPainter

logger = logging.getLogger(__name__)

class CellDelegate(QStyledItemDelegate):
    """
    儲存格代理元件 (Cell Delegate)

    負責高效能渲染數值資料，並支援依照欄位設定格式化數字 (例如：科學記號)。
    """

    def __init__(self, parent: Any = None) -> None:
        """
        初始化儲存格代理元件。

        Args:
            parent (Any, optional): 父元件。
        """
        super().__init__(parent)

    def paint(self, painter: QPainter, option: QStyleOptionViewItem, index: QModelIndex) -> None:
        """
        繪製儲存格內容。

        Args:
            painter (QPainter): 繪圖物件。
            option (QStyleOptionViewItem): 樣式選項。
            index (QModelIndex): 索引。
        """
        try:
            # 取得資料
            data = index.data(Qt.ItemDataRole.DisplayRole)
            
            # TODO: 根據欄位屬性進行不同的格式化
            # 這裡暫時簡單處理浮點數格式化
            display_text = str(data)
            if isinstance(data, (float, int)):
                # 簡單示範科學記號或是限制小數位數
                try:
                    num = float(data)
                    if abs(num) > 1e6 or (abs(num) < 1e-4 and num != 0):
                        display_text = f"{num:.4e}"
                    else:
                        display_text = f"{num:.4f}"
                except ValueError:
                    pass

            # 繪製背景
            self.initStyleOption(option, index)
            option.text = display_text
            
            # 使用預設繪製，但將文字置右，這適合數值顯示
            option.displayAlignment = Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter
            
            super().paint(painter, option, index)

        except Exception as e:
            logger.error(f"繪製儲存格時發生錯誤 (row={index.row()}, col={index.column()}): {e}")
            super().paint(painter, option, index)

    def displayText(self, value: Any, locale: Any) -> str:
        """
        取得顯示文字。如果 paint 被覆寫，這裡可能不會被呼叫到，但作為備用。
        """
        if isinstance(value, float):
            return f"{value:.4e}" if abs(value) > 1e6 else f"{value:.4f}"
        return super().displayText(value, locale)
