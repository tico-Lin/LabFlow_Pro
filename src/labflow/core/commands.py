from dataclasses import dataclass, field
from typing import Any
import uuid
import time
from pathlib import Path

@dataclass(kw_only=True)
class Command:
    """所有命令的基底類別。"""
    command_id: str = field(default_factory=lambda: uuid.uuid4().hex)
    timestamp: float = field(default_factory=time.time)

@dataclass(kw_only=True)
class CreateWorksheet(Command):
    """建立試算表。"""
    name: str
    rows: int
    cols: int

@dataclass(kw_only=True)
class CreateMatrix(Command):
    """建立矩陣。"""
    name: str
    shape: tuple[int, ...]
    dtype: str

@dataclass(kw_only=True)
class CreateGraph(Command):
    """建立圖表。"""
    name: str
    source_id: str

@dataclass(kw_only=True)
class SetCellValue(Command):
    """設定儲存格值。"""
    dataset_id: str
    row: int
    col: int
    value: float | str

@dataclass(kw_only=True)
class SetColumnData(Command):
    """設定欄資料。"""
    dataset_id: str
    col: int
    data: Any

@dataclass(kw_only=True)
class DeleteDataset(Command):
    """刪除資料集。"""
    dataset_id: str

@dataclass(kw_only=True)
class RenameDataset(Command):
    """重新命名資料集。"""
    dataset_id: str
    new_name: str

@dataclass(kw_only=True)
class RunCompute(Command):
    """執行計算。"""
    function_name: str
    source_id: str
    parameters: dict[str, Any]

@dataclass(kw_only=True)
class ChangeLocale(Command):
    """變更系統語系。"""
    locale: str

@dataclass(kw_only=True)
class ImportFile(Command):
    """匯入檔案。"""
    file_path: Path
    importer_name: str
    target_name: str
