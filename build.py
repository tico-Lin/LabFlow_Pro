import subprocess
import sys
from pathlib import Path

def build():
    try:
        import PySide6
        print(f"Found PySide6 version {PySide6.__version__} at {PySide6.__file__}")
    except ImportError:
        print("Error: PySide6 is not installed in the current environment.")
        print("Please activate your virtual environment (.venv) and install dependencies before building.")
        sys.exit(1)

    # 取得專案根目錄
    project_root = Path(__file__).parent.absolute()
    
    # 進入點
    entry_point = project_root / "src" / "labflow" / "app.py"
    
    # 額外的資源檔案 (包含 i18n JSON 等)
    locales_dir = project_root / "locales"
    config_dir = project_root / "config"
    plugins_dir = project_root / "plugins_example"
    
    add_data_args = [
        f"--add-data={locales_dir};locales",
        f"--add-data={config_dir};config",
        f"--add-data={plugins_dir};plugins_example",
    ]
    
    # 隱藏匯入，確保科學與 UI 套件被正確打包
    hidden_imports = [
        "--hidden-import=numpy",
        "--hidden-import=scipy",
        "--hidden-import=scipy.sparse",
        "--hidden-import=h5py",
        "--hidden-import=pandas",
        "--hidden-import=openpyxl",
        "--hidden-import=pyqtgraph",
        "--hidden-import=labflow.core",
        "--hidden-import=labflow.engine",
        "--hidden-import=labflow.ui",
        "--hidden-import=labflow.data",
        "--hidden-import=labflow.api",
        "--hidden-import=labflow.plugins",
        "--collect-all=PySide6",
        "--collect-all=pyqtgraph",
    ]
    
    # PyInstaller 參數
    args = [
        sys.executable, "-m", "PyInstaller",
        str(entry_point),
        "--name=LabFlowPro",
        "--windowed", # 啟動時不顯示終端機 (Windows)
        "--clean",
        "--noconfirm",
    ]
    
    args.extend(add_data_args)
    args.extend(hidden_imports)
    
    print("開始編譯 LabFlow Pro...")
    print(f"指令參數: {' '.join(args)}")
    
    subprocess.check_call(args)

if __name__ == "__main__":
    build()

