import re
import uuid
import numpy as np
from datetime import datetime
from typing import IO, Union, Path
from labflow.parsers.base import AbstractDataParser, CorruptedFileError
from labflow.core.models.sdom import ExperimentRecord, DataSeries, MetadataSchema

class ElectrochemicalCVParser(AbstractDataParser):
    """電化學循環伏安法 (CV) 數據解析器"""
    
    def can_parse(self, file_path_or_bytes: Union[str, Path, bytes]) -> bool:
        if isinstance(file_path_or_bytes, (str, Path)):
            ext = str(file_path_or_bytes).lower()
            return ext.endswith(".mpt") or ext.endswith(".txt") or ext.endswith(".csv")
        return False
        
    def parse(self, stream: IO[bytes]) -> ExperimentRecord:
        metadata_params = {}
        data_rows = []
        in_data_section = False
        
        # 使用 iter 避免一次載入全部記憶體
        for line_bytes in stream:
            # 簡單假設 utf-8
            line = line_bytes.decode('utf-8', errors='ignore').strip()
            
            if not line:
                continue
                
            # 解析詮釋資料 (以掃描速率、電位窗口、週期數為例)
            if not in_data_section:
                # 若遇到常見的表頭結束標記，或全數字開頭
                if "Scan Rate" in line or "dE/dt" in line:
                    match = re.search(r'([0-9.]+)\s*(mV/s|V/s)', line, re.IGNORECASE)
                    if match:
                        metadata_params["scan_rate"] = float(match.group(1))
                        metadata_params["scan_rate_unit"] = match.group(2)
                        
                elif "Cycles" in line or "Number of cycles" in line:
                    match = re.search(r'([0-9]+)', line)
                    if match:
                        metadata_params["cycles"] = int(match.group(1))
                        
                elif "Ewe/V" in line and "I/mA" in line:
                    # mpt 檔案的常見欄位標頭
                    in_data_section = True
                    continue
                elif re.match(r'^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?[\s,]+[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?', line):
                    # 遇到兩欄以上的數字列，視為資料段開始
                    in_data_section = True
                    
            if in_data_section:
                try:
                    # 分割字串 (支援逗號或空白)
                    parts = [float(x) for x in re.split(r'[\s,]+', line) if x]
                    if len(parts) >= 2:
                        data_rows.append((parts[0], parts[1]))
                except ValueError:
                    # 忽略無法轉為 float 的雜訊
                    continue

        if not data_rows:
            raise CorruptedFileError("未能在檔案中找到有效的數值資料段")

        # 為了避免 OOM，這裡用 list 收集後再一次性轉 numpy array，
        # 在 50MB 檔案（約 150 萬筆雙浮點數，約 24MB）下，list overhead 在可接受範圍 (<100MB)
        # 若要更極致的優化，可直接使用 byte chunk parsing + pre-allocation
        data_array = np.array(data_rows, dtype=np.float64)
        
        # 提取電位窗口
        metadata_params["potential_window"] = {
            "min": float(np.min(data_array[:, 0])),
            "max": float(np.max(data_array[:, 0]))
        }
        
        series_e = DataSeries(name="Potential", unit="V", data=data_array[:, 0])
        series_i = DataSeries(name="Current", unit="A", data=data_array[:, 1])
        
        return ExperimentRecord(
            id=str(uuid.uuid4()),
            timestamp=datetime.now(),
            metadata=MetadataSchema(operator="auto-parser", params=metadata_params),
            series=[series_e, series_i]
        )

