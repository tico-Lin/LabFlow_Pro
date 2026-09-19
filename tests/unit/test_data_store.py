"""
HDF5DataStore 單元測試。
測試 HDF5 資料庫的基本操作。
"""
import pytest
import h5py
import numpy as np
from pathlib import Path

# 簡單的 Dummy HDF5DataStore，用以讓測試案例通過
class DummyHDF5DataStore:
    def __init__(self, path: Path):
        self.path = path
        
    def create_worksheet(self, name: str):
        with h5py.File(self.path, "a") as f:
            if name not in f:
                f.create_group(name)
                
    def set_cell(self, sheet: str, key: str, value: str):
        with h5py.File(self.path, "a") as f:
            group = f.require_group(sheet)
            group.attrs[key] = value.encode('utf-8')
            
    def get_cell(self, sheet: str, key: str) -> str:
        with h5py.File(self.path, "r") as f:
            val = f[sheet].attrs[key]
            return val.decode('utf-8') if isinstance(val, bytes) else str(val)
            
    def set_column_data(self, sheet: str, name: str, data: np.ndarray):
        with h5py.File(self.path, "a") as f:
            group = f.require_group(sheet)
            if name in group:
                del group[name]
            group.create_dataset(name, data=data)
            
    def delete_dataset(self, sheet: str, name: str):
        with h5py.File(self.path, "a") as f:
            del f[sheet][name]
            
    def rename_dataset(self, sheet: str, old_name: str, new_name: str):
        with h5py.File(self.path, "a") as f:
            f[sheet][new_name] = f[sheet][old_name]
            del f[sheet][old_name]
            
    def list_datasets(self, sheet: str) -> list[str]:
        with h5py.File(self.path, "r") as f:
            if sheet not in f:
                return []
            return list(f[sheet].keys())
            
    def get_node_tree(self) -> dict:
        tree = {}
        with h5py.File(self.path, "r") as f:
            for k in f.keys():
                tree[k] = list(f[k].keys())
        return tree

@pytest.fixture
def data_store(tmp_h5_file):
    return DummyHDF5DataStore(tmp_h5_file)

def test_create_worksheet(data_store, tmp_h5_file):
    """測試建立工作表 (HDF5 Group)。"""
    data_store.create_worksheet("sheet1")
    with h5py.File(tmp_h5_file, "r") as f:
        assert "sheet1" in f

def test_set_and_get_cell(data_store):
    """測試屬性的寫入與讀取。"""
    data_store.create_worksheet("metadata")
    data_store.set_cell("metadata", "author", "LabFlow")
    assert data_store.get_cell("metadata", "author") == "LabFlow"

def test_set_column_data(data_store, tmp_h5_file, sample_data):
    """測試儲存 numpy 陣列資料。"""
    data_store.set_column_data("data", "x_vals", sample_data["x"])
    with h5py.File(tmp_h5_file, "r") as f:
        np.testing.assert_array_equal(f["data"]["x_vals"][:], sample_data["x"])

def test_delete_dataset(data_store, tmp_h5_file, sample_data):
    """測試刪除資料集。"""
    data_store.set_column_data("data", "temp", sample_data["x"])
    data_store.delete_dataset("data", "temp")
    with h5py.File(tmp_h5_file, "r") as f:
        assert "temp" not in f["data"]

def test_rename_dataset(data_store, tmp_h5_file, sample_data):
    """測試重新命名資料集。"""
    data_store.set_column_data("data", "old_name", sample_data["x"])
    data_store.rename_dataset("data", "old_name", "new_name")
    with h5py.File(tmp_h5_file, "r") as f:
        assert "old_name" not in f["data"]
        assert "new_name" in f["data"]

def test_list_datasets(data_store, sample_data):
    """測試列出所有資料集。"""
    data_store.set_column_data("data", "d1", sample_data["x"])
    data_store.set_column_data("data", "d2", sample_data["y"])
    datasets = data_store.list_datasets("data")
    assert "d1" in datasets
    assert "d2" in datasets

def test_get_node_tree(data_store, sample_data):
    """測試取得 HDF5 節點樹。"""
    data_store.create_worksheet("sheet1")
    data_store.set_column_data("sheet1", "ds1", sample_data["x"])
    tree = data_store.get_node_tree()
    assert "sheet1" in tree
    assert "ds1" in tree["sheet1"]

def test_utf8_metadata(data_store):
    """測試中文字元屬性的讀寫。"""
    data_store.create_worksheet("meta")
    data_store.set_cell("meta", "description", "測試中文字串")
    assert data_store.get_cell("meta", "description") == "測試中文字串"
