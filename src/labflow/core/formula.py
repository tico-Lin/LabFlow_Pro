import re
import numpy as np

class FormulaEngine:
    """
    公式解析與計算引擎。
    支援 Origin-style 語法: Col(A), Col(A)[1] 以及 NumPy 數學函式。
    """
    
    # Regex to match Col(A) or Col(A)[2]
    COL_PATTERN = re.compile(r"Col\(([A-Za-z]+)\)(?:\[(\d+)\])?")
    
    @staticmethod
    def letter_to_col(letter: str) -> int:
        """將字母轉換為欄位索引 (A=0, B=1, Z=25, AA=26)"""
        col = 0
        for char in letter.upper():
            col = col * 26 + (ord(char) - ord('A') + 1)
        return col - 1

    @classmethod
    def evaluate(cls, expression: str, dataset_handle) -> np.ndarray:
        """
        計算公式並回傳結果矩陣。
        """
        locals_dict = {}
        
        def replacer(match):
            letter = match.group(1)
            row_idx_str = match.group(2)
            
            col_idx = cls.letter_to_col(letter)
            var_name = f"_col_{col_idx}"
            
            if var_name not in locals_dict:
                # Load the column data and convert to float for math
                try:
                    # DatasetHandle supports slice
                    col_data = dataset_handle[:, col_idx]
                    
                    # Convert to float, replacing empty string with nan
                    if col_data.dtype.kind in 'SUO':
                        # String data
                        float_data = np.zeros_like(col_data, dtype=np.float64)
                        for i, val in enumerate(col_data):
                            try:
                                float_data[i] = float(val) if val else np.nan
                            except ValueError:
                                float_data[i] = np.nan
                        locals_dict[var_name] = float_data
                    else:
                        locals_dict[var_name] = col_data.astype(np.float64)
                except Exception as e:
                    import logging
                    logging.getLogger(__name__).error(f"Cannot load Col({letter}): {e}")
                    raise RuntimeError(f"無法載入欄位 Col({letter})")
            
            if row_idx_str:
                row_idx = int(row_idx_str) - 1 # 1-indexed for user
                return f"{var_name}[{row_idx}]"
            return var_name

        # Rewrite expression
        rewritten_expr = cls.COL_PATTERN.sub(replacer, expression)
        
        # Build safe globals (numpy math functions)
        safe_globals = {
            "__builtins__": None,
            "sin": np.sin,
            "cos": np.cos,
            "tan": np.tan,
            "exp": np.exp,
            "log": np.log,
            "log10": np.log10,
            "sqrt": np.sqrt,
            "abs": np.abs,
            "pi": np.pi,
            "e": np.e
        }
        
        try:
            result = eval(rewritten_expr, safe_globals, locals_dict)
            return np.asarray(result)
        except Exception as e:
            raise RuntimeError(f"公式解析失敗: {e}")

