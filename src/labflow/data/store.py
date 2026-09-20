"""
資料儲存模組，提供專案資料存取介面。
"""

import logging
import uuid
from typing import Any, Protocol
import numpy as np
import h5py

from labflow.core.types import DatasetId, ColumnSpec
from labflow.core.errors import DataStoreError, DatasetNotFoundError
from .dataset import DatasetHandle

logger = logging.getLogger(__name__)

class DataStore(Protocol):
    """
    資料儲存介面。
    """
    def create_worksheet(self, name: str, columns: list[ColumnSpec]) -> str: ...
    def create_matrix(self, name: str, rows: int, cols: int) -> str: ...
    def get_dataset(self, dataset_id: DatasetId) -> DatasetHandle: ...
    def list_datasets(self, group: str = '/') -> list[str]: ...
    def delete_dataset(self, dataset_id: DatasetId) -> None: ...
    def rename_dataset(self, dataset_id: DatasetId, new_name: str) -> str: ...
    def set_cell(self, dataset_id: DatasetId, row: int, col: int, value: float | str) -> None: ...
    def set_column_data(self, dataset_id: DatasetId, col: int, data: np.ndarray) -> None: ...
    def get_column_data(self, dataset_id: DatasetId, col: int) -> np.ndarray: ...
    def get_node_tree(self) -> dict[str, Any]: ...
    def create_dataset(self, path: str, data: np.ndarray) -> str: ...

class HDF5DataStore(DataStore):
    """
    HDF5 實作的資料儲存。
    """
    def __init__(self, h5file: h5py.File):
        self._file = h5file
        self.chunk_size = 10000
        self.compression = 4

    def _generate_id(self) -> str:
        return str(uuid.uuid4())

    def create_worksheet(self, name: str, columns: list[ColumnSpec]) -> str:
        try:
            ws_id = f"worksheets/{self._generate_id()}"
            group = self._file.create_group(ws_id)
            group.attrs['name'] = name.encode('utf-8')
            for i, col in enumerate(columns):
                dt = h5py.special_dtype(vlen=str) if getattr(col, 'type', 'float') == 'string' else np.float64
                ds = group.create_dataset(
                    f"col_{i}",
                    shape=(0,),
                    maxshape=(None,),
                    dtype=dt,
                    chunks=(self.chunk_size,),
                    compression="gzip",
                    compression_opts=self.compression
                )
                col_name = getattr(col, 'name', f"Column {i}")
                ds.attrs['name'] = col_name.encode('utf-8')
            return ws_id
        except Exception as e:
            logger.error(f"建立工作表失敗: {e}")
            raise DataStoreError(f"建立工作表失敗: {e}")

    def create_matrix(self, name: str, rows: int, cols: int) -> str:
        try:
            mat_id = f"matrices/{self._generate_id()}"
            ds = self._file.create_dataset(
                mat_id,
                shape=(rows, cols),
                maxshape=(None, None),
                dtype=np.float64,
                chunks=(min(rows, self.chunk_size), min(cols, self.chunk_size)),
                compression="gzip",
                compression_opts=self.compression
            )
            ds.attrs['name'] = name.encode('utf-8')
            return mat_id
        except Exception as e:
            logger.error(f"建立矩陣失敗: {e}")
            raise DataStoreError(f"建立矩陣失敗: {e}")

    def create_dataset(self, path: str, data: np.ndarray) -> str:
        """
        建立新的資料集並寫入資料。
        """
        try:
            if path in self._file:
                del self._file[path]
            ds = self._file.create_dataset(path, data=data)
            ds.attrs['name'] = path.split('/')[-1].encode('utf-8')
            ds.attrs['type'] = 'matrix'
            return path
        except Exception as e:
            logger.error(f"建立資料集失敗: {e}")
            raise DataStoreError(f"建立資料集失敗: {e}")

    def get_dataset(self, dataset_id: DatasetId) -> DatasetHandle:
        try:
            if dataset_id not in self._file:
                raise DatasetNotFoundError(f"找不到資料集: {dataset_id}")
            item = self._file[dataset_id]
            if not isinstance(item, h5py.Dataset):
                raise DataStoreError(f"路徑 {dataset_id} 不是一個資料集")
            return DatasetHandle(item)
        except DatasetNotFoundError:
            raise
        except Exception as e:
            logger.error(f"取得資料集失敗: {e}")
            raise DataStoreError(f"取得資料集失敗: {e}")

    def list_datasets(self, group: str = '/') -> list[str]:
        try:
            if group not in self._file:
                return []
            result = []
            def visitor(name: str, obj: Any) -> None:
                if isinstance(obj, h5py.Dataset):
                    result.append(name)
            self._file[group].visititems(visitor)
            return result
        except Exception as e:
            logger.error(f"列出資料集失敗: {e}")
            raise DataStoreError(f"列出資料集失敗: {e}")

    def delete_dataset(self, dataset_id: DatasetId) -> None:
        try:
            if dataset_id in self._file:
                del self._file[dataset_id]
        except Exception as e:
            logger.error(f"刪除資料集失敗: {e}")
            raise DataStoreError(f"刪除資料集失敗: {e}")

    def rename_dataset(self, dataset_id: DatasetId, new_name: str) -> str:
        try:
            if dataset_id not in self._file:
                raise DatasetNotFoundError(f"找不到資料集: {dataset_id}")
            self._file[dataset_id].attrs['name'] = new_name.encode('utf-8')
            return dataset_id
        except DatasetNotFoundError:
            raise
        except Exception as e:
            logger.error(f"重新命名資料集失敗: {e}")
            raise DataStoreError(f"重新命名資料集失敗: {e}")

    def set_cell(self, dataset_id: DatasetId, row: int, col: int, value: float | str) -> None:
        try:
            if dataset_id.startswith('worksheets/'):
                col_ds = self._file[f"{dataset_id}/col_{col}"]
                if row >= col_ds.shape[0]:
                    col_ds.resize((row + 1,))
                col_ds[row] = value
            else:
                ds = self._file[dataset_id]
                if row >= ds.shape[0] or col >= ds.shape[1]:
                    ds.resize((max(ds.shape[0], row + 1), max(ds.shape[1], col + 1)))
                ds[row, col] = value
        except Exception as e:
            logger.error(f"設定儲存格失敗: {e}")
            raise DataStoreError(f"設定儲存格失敗: {e}")

    def set_column_data(self, dataset_id: DatasetId, col: int, data: np.ndarray) -> None:
        try:
            col_ds = self._file[f"{dataset_id}/col_{col}"]
            col_ds.resize(data.shape)
            col_ds[:] = data
        except Exception as e:
            logger.error(f"設定欄位資料失敗: {e}")
            raise DataStoreError(f"設定欄位資料失敗: {e}")

    def get_column_data(self, dataset_id: DatasetId, col: int) -> np.ndarray:
        try:
            return self._file[f"{dataset_id}/col_{col}"][:]
        except Exception as e:
            logger.error(f"取得欄位資料失敗: {e}")
            raise DataStoreError(f"取得欄位資料失敗: {e}")

    def get_node_tree(self) -> dict[str, Any]:
        tree: dict[str, Any] = {}
        def build_tree(name: str, obj: Any) -> None:
            parts = name.split('/')
            current = tree
            
            # Traverse to the parent
            for part in parts[:-1]:
                if part not in current:
                    current[part] = {'type': 'group', 'attrs': {}, 'children': {}, 'path': ''}
                if 'children' not in current[part]:
                    current[part]['children'] = {}
                current = current[part]['children']
            
            # Set the current node
            leaf_name = parts[-1]
            if leaf_name not in current:
                current[leaf_name] = {'children': {}}
                
            node_info = current[leaf_name]
            node_info['path'] = name
            node_info['attrs'] = {k: (v.decode('utf-8') if isinstance(v, bytes) else v) for k, v in obj.attrs.items()}
            
            if isinstance(obj, h5py.Dataset):
                node_type = node_info['attrs'].get('type', 'dataset')
                node_info['type'] = node_type
                node_info['shape'] = obj.shape
                node_info['dtype'] = str(obj.dtype)
            else:
                node_info['type'] = 'group'

        try:
            self._file.visititems(build_tree)
            return tree
        except Exception as e:
            logger.error(f"取得節點樹失敗: {e}")
            raise DataStoreError(f"取得節點樹失敗: {e}")

    def flush(self) -> None:
        try:
            self._file.flush()
        except Exception as e:
            logger.error(f"儲存資料失敗: {e}")
            raise DataStoreError(f"儲存資料失敗: {e}")
