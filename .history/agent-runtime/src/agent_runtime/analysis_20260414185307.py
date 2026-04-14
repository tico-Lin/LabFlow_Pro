"""
analysis.py - 提供資料分析相關函數
"""

def find_max_peak(voltages: list[float], currents: list[float]) -> dict:
    """
    尋找 currents 中最大值的 index，並回傳對應的電壓與電流。
    Args:
        voltages (list[float]): 電壓數值陣列
        currents (list[float]): 電流數值陣列
    Returns:
        dict: {'index': i, 'voltage': v, 'current': c}
    """
    if not currents or not voltages or len(currents) != len(voltages):
        raise ValueError("currents 和 voltages 必須為非空且長度相同的 list")
    max_idx = 0
    max_val = currents[0]
    for i, c in enumerate(currents):
        if c > max_val:
            max_val = c
            max_idx = i
    return {'index': max_idx, 'voltage': voltages[max_idx], 'current': currents[max_idx]}
