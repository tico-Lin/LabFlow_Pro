"""
資料集處理模組，封裝 HDF5 資料集操作。
"""

import logging
from typing import Any
import numpy as np
import h5py

logger = logging.getLogger(__name__)

class DatasetHandle:
    """
    HDF5 資料集封裝類別。
    提供安全的資料讀寫與屬性操作。
    """
    
    def __init__(self, h5_dataset: h5py.Dataset):
        self._dataset = h5_dataset

    @property
    def name(self) -> str:
        """取得資料集名稱。"""
        return str(self._dataset.name.split('/')[-1])

    @property
    def shape(self) -> tuple[int, ...]:
        """取得資料集形狀。"""
        return tuple(self._dataset.shape)
        
    @property
    def dtype(self) -> np.dtype:
        """取得資料類型。"""
        return self._dataset.dtype

    def __getitem__(self, args) -> np.ndarray:
        """支援直接切片讀取 (延遲載入/記憶體最佳化)。"""
        return self._dataset[args]

    @property
    def attrs(self) -> dict[str, Any]:
        """取得所有屬性。"""
        return dict(self._dataset.attrs)

    @property
    def path(self) -> str:
        """取得資料集在 HDF5 中的完整路徑。"""
        return str(self._dataset.name)

    def read(self, start: int = 0, end: int | None = None) -> np.ndarray:
        """
        讀取指定範圍的資料。
        """
        if end is None:
            end = self.shape[0]
        try:
            return self._dataset[start:end]
        except Exception as e:
            logger.error(f"讀取資料集 {self.path} 時發生錯誤: {e}")
            raise

    def write(self, data: np.ndarray, start: int = 0) -> None:
        """
        寫入資料到指定位置。
        """
        end = start + data.shape[0]
        try:
            if end > self.shape[0]:
                new_shape = list(self.shape)
                new_shape[0] = end
                self._dataset.resize(tuple(new_shape))
            self._dataset[start:end] = data
        except Exception as e:
            logger.error(f"寫入資料集 {self.path} 時發生錯誤: {e}")
            raise

    def read_all(self) -> np.ndarray:
        """讀取全部資料。"""
        return self.read()

    def get_metadata(self) -> dict[str, Any]:
        """取得所有詮釋資料 (Metadata)。"""
        meta = {}
        for k, v in self._dataset.attrs.items():
            if isinstance(v, bytes):
                meta[k] = v.decode('utf-8')
            else:
                meta[k] = v
        return meta

    def set_metadata(self, key: str, value: Any) -> None:
        """設定單一詮釋資料。"""
        try:
            if isinstance(value, str):
                self._dataset.attrs[key] = value.encode('utf-8')
            else:
                self._dataset.attrs[key] = value
        except Exception as e:
            logger.error(f"設定詮釋資料 {key} 時發生錯誤: {e}")
            raise

    def __enter__(self) -> 'DatasetHandle':
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        pass
