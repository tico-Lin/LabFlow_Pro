"""analysis.py - 提供資料分析相關函數。"""

from __future__ import annotations

import json
import math


def find_max_peak(voltages: list[float], currents: list[float]) -> dict:
    """尋找 currents 中最大值的 index，並回傳對應的電壓與電流。"""
    if not currents or not voltages or len(currents) != len(voltages):
        raise ValueError("currents 和 voltages 必須為非空且長度相同的 list")

    max_idx = 0
    max_val = currents[0]
    for i, current in enumerate(currents):
        if current > max_val:
            max_val = current
            max_idx = i

    return {
        "index": max_idx,
        "voltage": voltages[max_idx],
        "current": currents[max_idx],
    }


def _load_json(payload: str) -> dict | list:
    if not payload:
        return {}

    loaded = json.loads(payload)
    if loaded is None:
        return {}
    if not isinstance(loaded, (dict, list)):
        raise ValueError("payload 必須是 JSON object 或 list")
    return loaded


def _extract_series(data_payload: dict | list) -> tuple[list[float], list[float]]:
    if isinstance(data_payload, list):
        voltages = [float(point["x"]) for point in data_payload if isinstance(point, dict) and "x" in point]
        currents = [float(point["y"]) for point in data_payload if isinstance(point, dict) and "y" in point]
        if len(voltages) != len(currents):
            raise ValueError("chart point list 必須同時包含 x 與 y")
        return voltages, currents

    nested_data = data_payload.get("data")
    source = nested_data if isinstance(nested_data, dict) else data_payload

    x_values = source.get("x", source.get("voltages", []))
    y_values = source.get("y", source.get("currents", []))
    if not isinstance(x_values, list) or not isinstance(y_values, list):
        raise ValueError("x/y 或 voltages/currents 必須是 list")

    voltages = [float(value) for value in x_values]
    currents = [float(value) for value in y_values]
    return voltages, currents


def run_module(module_id: str, params_str: str, data_str: str) -> str:
    params = _load_json(params_str)
    data_payload = _load_json(data_str)

    if module_id == "generate_sine_wave":
        frequency = float(params.get("frequency", 1.0))
        amplitude = float(params.get("amplitude", 1.0))
        x_values = [index / 99 for index in range(100)]
        y_values = [amplitude * math.sin(2 * math.pi * frequency * x) for x in x_values]
        return json.dumps({"data": {"x": x_values, "y": y_values}})

    if module_id == "find_max_peak":
        voltages, currents = _extract_series(data_payload)
        result = find_max_peak(voltages, currents)
        return json.dumps(result)

    raise ValueError(f"unknown analysis module: {module_id}")
