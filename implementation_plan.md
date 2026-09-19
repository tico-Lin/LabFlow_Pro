# 專案大整理與代碼解耦計畫 (Code Cleanup & Decoupling Plan)

依照您的最新指示，這次清理不只針對 `LabFlow_Pro` 內部的代碼解耦，還將涵蓋最外層的 `org` (原 Origin) 目錄，全面汰除舊有的 Origin 遺留檔案，讓整個專案徹底脫胎換骨為純粹的 LabFlow Pro！

## User Review Required

> [!CAUTION]
> **極度危險操作警告 (CRITICAL DESTRUCTIVE ACTION)**
> 此計畫將會刪除 `d:\tico.lin\Desktop\org` 目錄下**所有**舊版 Origin 軟體的相關檔案與資料夾（包含 `OriginC`, `FitFunc`, `Templates` 等數百個檔案），僅保留我們全新開發的 `LabFlow_Pro` 目錄。
> 請您務必確認舊版 Origin 檔案已經不需要，或者您已經在其他地方有備份。

## Proposed Changes

### 1. 最外層目錄清理 (清理舊版 Origin)

#### [DELETE] `d:\tico.lin\Desktop\org` 底下的所有非 LabFlow 檔案
我們將會刪除 `org` 目錄底下的所有舊有檔案與資料夾，**僅保留以下項目**：
* `LabFlow_Pro` (我們的全新專案)

### 2. LabFlow_Pro 內部資料層清理 (labflow.data)

我們在 Phase 3 和 4 中，將資料流改為直接在 UI 讀取 `HDF5DataStore` 中的原始 NumPy 陣列 (透過 `DatasetHandle`) 以達成極致效能，這使得原本第一階段設計的中介模型變得冗餘。

#### [DELETE] `src/labflow/data/worksheet_model.py`
已不再使用。目前的 `DatasetTableModel` 直接對接 `DatasetHandle`，大幅降低記憶體與抽象層的開銷。

#### [DELETE] `src/labflow/data/matrix_model.py`
已不再使用。

#### [DELETE] `src/labflow/data/lazy_loader.py`
已不再使用。HDF5 (`h5py.Dataset`) 本身就自帶完美的延遲載入 (Lazy Loading) 功能。

#### [DELETE] `src/labflow/data/schema.py`
已不再使用。

#### [DELETE] `src/labflow/data/graph_spec.py`
已不再使用。目前繪圖系統 (`graph_canvas.py`) 採用訊號傳遞與實時渲染。

#### [DELETE] `src/labflow/data/project.py`
已不再使用。`HDF5DataStore` 已經自動將專案持久化於磁碟中。

#### [DELETE] `src/labflow/data/importers/` (整個目錄)
已不再使用。CSV 與 HDF5 檔案的匯入與錯誤處理邏輯已經被直接內建於 `main_window.py` 與 `DataStore` 中，這使得匯入系統更加穩定且直覺。

#### [MODIFY] `src/labflow/data/__init__.py`
移除對上述已刪除模組的引用，確保系統乾淨。

### 3. LabFlow_Pro 內部核心層清理 (labflow.core)

#### [DELETE] `src/labflow/core/commands.py`
已不再使用。原定使用 Command Pattern，但後來採用 `EventBus` 與非同步的 `ComputeDispatcher`，更加簡潔。

#### [DELETE] `src/labflow/core/state.py`
已不再使用。狀態管理已經轉由 `Kernel` 和 `DataStore` 負責。

#### [MODIFY] `src/labflow/core/__init__.py`
移除已刪除模組的引用。

### 4. LabFlow_Pro UI 層清理 (labflow.ui)

#### [MODIFY] `src/labflow/ui/models/dataset_table_model.py`
移除 `WorksheetModel` 的未使用 import。

## Verification Plan

### Automated Tests
- 清理後確認 `d:\tico.lin\Desktop\org` 內只剩下 `LabFlow_Pro`。
- 確認 `LabFlow_Pro\src\labflow\app.py` 仍能順利啟動，無任何 `ModuleNotFoundError`。
- 專案打包指令 `python build.py` 可以正常運作。

### Manual Verification
- 重新啟動專案，確認 CSV 匯入、資料展示、分析功能皆能正常使用。
