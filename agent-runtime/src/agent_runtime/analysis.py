"""analysis.py - 提供資料分析相關函數。"""

from __future__ import annotations

import json
import math
import ast
from typing import List, Dict, Any, Optional

class ToTNode:
    """Node in the Tree of Thoughts representing a possible implementation path."""
    def __init__(self, state: Dict[str, Any], parent: Optional['ToTNode'] = None):
        self.state = state  # Contains current AST or code state
        self.parent = parent
        self.children: List['ToTNode'] = []
        self.score: float = 0.0

def decompose_task_to_ast(high_level_goal: str) -> List[Dict[str, Any]]:
    """
    Parses high-level goals (e.g., 'implement chemical structure drawing algorithm')
    and degrades them into specific Abstract Syntax Tree (AST) modifications or module incremental code.
    Uses Tree of Thoughts (ToT) to generate multiple possible implementation paths.
    """
    # 1. Initialize Root Thought (Initial State)
    initial_state = {"goal": high_level_goal, "ast_modifications": [], "incremental_code": ""}
    root = ToTNode(state=initial_state)
    
    # 2. Expand thoughts (mocking the generation of multiple paths)
    # In a real implementation, this would call an LLM to generate next possible states.
    path_1 = ToTNode(state={"goal": high_level_goal, "ast_modifications": [{"type": "AddFunction", "name": "draw_chemical_structure"}], "incremental_code": "def draw_chemical_structure(): pass"}, parent=root)
    path_2 = ToTNode(state={"goal": high_level_goal, "ast_modifications": [{"type": "ImportModule", "name": "rdkit"}], "incremental_code": "import rdkit"}, parent=root)
    root.children.extend([path_1, path_2])
    
    # 3. Return generated paths
    paths = []
    for child in root.children:
        paths.append({
            "path_id": id(child),
            "ast_modifications": child.state.get("ast_modifications", []),
            "incremental_code": child.state.get("incremental_code", "")
        })
    return paths


def get_available_modules() -> str:
    modules = [
         {
            "id": "magic_filter",
            "name": "魔法濾波器",
            "description": "用神秘力量過濾雜訊",
            "supportedFormats": ["CSV"],
            "parameters": [
            {
            "key": "magic_power",
            "name": "魔力強度",
            "type": "number",
            "defaultValue": 99
            }
            ]
         },
        {
            "id": "find_max_peak",
            "name": "Peak Finder",
            "description": "Find the highest current peak and return its index, voltage, and current.",
            "supportedFormats": ["CV", "XRD"],
            "parameters": [
                {
                    "key": "threshold",
                    "name": "Threshold",
                    "type": "number",
                    "defaultValue": 0.8,
                }
            ],
        },
        {
            "id": "generate_sine_wave",
            "name": "Sine Wave Generator",
            "description": "Generate a sine wave dataset for testing and preview workflows.",
            "supportedFormats": ["Test Only"],
            "parameters": [
                {
                    "key": "frequency",
                    "name": "Frequency",
                    "type": "number",
                    "defaultValue": 1,
                },
                {
                    "key": "amplitude",
                    "name": "Amplitude",
                    "type": "number",
                    "defaultValue": 1,
                },
            ],
        },
    ]
    return json.dumps(modules)


import numpy as np

def find_max_peak(voltages: list[float], currents: list[float]) -> dict:
    """尋找 currents 中最大值的 index，並回傳對應的電壓與電流。"""
    if not currents or not voltages or len(currents) != len(voltages):
        raise ValueError("currents 和 voltages 必須為非空且長度相同的 list")

    # Use NumPy for C-level fast processing (O(N) time, zero-copy if possible)
    currents_arr = np.array(currents)
    max_idx = int(np.argmax(currents_arr))
    max_val = float(currents_arr[max_idx])

    return {
        "index": max_idx,
        "voltage": voltages[max_idx],
        "current": max_val,
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

import grpc
import labflow_pb2
import labflow_pb2_grpc

class AgentEventStreamClient:
    """gRPC Bidirectional stream stub for UI events and Analysis results."""
    def __init__(self, session_id: str):
        self.session_id = session_id
        # In real scenario: connect to host service
        self.channel = grpc.insecure_channel('localhost:50051')
        self.stub = labflow_pb2_grpc.AgentServiceStub(self.channel)
        
    def stream_events(self, request_iterator):
        """Mock bidirectional stream processing."""
        # return self.stub.AgentEventStream(request_iterator)
        for req in request_iterator:
            yield {
                "session_id": self.session_id,
                "response_type": "ACK_ANALYSIS",
                "payload": b'{}'
            }

