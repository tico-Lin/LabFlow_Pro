"""
核心模組的錯誤與例外階層定義。
"""
class LabFlowError(Exception):
    """系統基礎錯誤例外。"""
    pass

class DataStoreError(LabFlowError):
    """資料層存取錯誤。"""
    pass

class DatasetNotFoundError(DataStoreError):
    """找不到指定的資料集。"""
    pass

class SchemaValidationError(DataStoreError):
    """HDF5 結構驗證失敗。"""
    pass

class ProjectFileError(LabFlowError):
    """專案檔案 (.lfp) 操作錯誤。"""
    pass

class PluginError(LabFlowError):
    """外掛模組載入或執行失敗。"""
    pass

class TranslationError(LabFlowError):
    """多國語系 (i18n) 錯誤。"""
    pass

class ConfigError(LabFlowError):
    """設定檔相關錯誤。"""
    pass

class ComputeError(LabFlowError):
    """計算執行失敗。"""
    pass
