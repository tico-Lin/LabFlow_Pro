"""
pytest 共享 fixtures 模組。
提供測試用的暫存檔案、模擬物件與樣本資料。
"""
import pytest
import h5py
import numpy as np
from pathlib import Path
from typing import Generator, Dict, Any
from unittest.mock import MagicMock

@pytest.fixture
def tmp_h5_file(tmp_path: Path) -> Generator[Path, None, None]:
    """建立暫存的 HDF5 檔案供測試使用。"""
    file_path = tmp_path / "test_data.h5"
    with h5py.File(file_path, "w") as f:
        # 建立基礎結構
        f.create_group("data")
    yield file_path
    if file_path.exists():
        file_path.unlink()

@pytest.fixture
def tmp_project_file(tmp_path: Path) -> Generator[Path, None, None]:
    """建立暫存的專案檔 (.lfp)。"""
    file_path = tmp_path / "test_project.lfp"
    # 模擬初始化 schema (空檔案)
    file_path.touch()
    yield file_path
    if file_path.exists():
        file_path.unlink()

@pytest.fixture
def mock_event_bus() -> Any:
    """提供模擬的 EventBus 物件。待實際實作後可替換為真實實例。"""
    bus = MagicMock()
    # 模擬 subscribe, emit, dispatch 等方法
    return bus

@pytest.fixture
def sample_data() -> Dict[str, np.ndarray]:
    """提供樣本 numpy 陣列作為測試資料。"""
    return {
        "x": np.linspace(0, 10, 100),
        "y": np.sin(np.linspace(0, 10, 100)),
        "noise": np.random.normal(0, 0.1, 100)
    }
