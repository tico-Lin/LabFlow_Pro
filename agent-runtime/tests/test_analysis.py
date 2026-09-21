import sys
import os
import json
import numpy as np

# add src/agent_runtime to path for grpc imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../src/agent_runtime")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../src")))

from agent_runtime.analysis import run_module, apply_savgol_filter, apply_fft

def test_savgol_filter():
    # generate noisy sine wave
    x = np.linspace(0, 10, 100).tolist()
    y = (np.sin(x) + np.random.normal(0, 0.1, 100)).tolist()

    result = apply_savgol_filter(x, y, 11, 2)
    assert "data" in result
    assert "x" in result["data"]
    assert "y" in result["data"]
    assert len(result["data"]["y"]) == 100

def test_fft():
    # generate a sine wave with known frequency
    t = np.linspace(0, 1, 400).tolist()
    y = np.sin(2 * np.pi * 50 * np.array(t)).tolist() # 50 Hz sine wave

    result = apply_fft(t, y)
    assert "data" in result
    assert "x" in result["data"]
    assert "y" in result["data"]
    # The max peak in y should correspond to an x frequency of 50
    y_fft = result["data"]["y"]
    x_fft = result["data"]["x"]
    max_idx = np.argmax(y_fft)
    freq = x_fft[max_idx]
    assert abs(freq - 50.0) < 1.0

if __name__ == "__main__":
    test_savgol_filter()
    test_fft()
    print("All analysis tests passed!")
import pytest
import numpy as np
from agent_runtime.agent import Critic

def test_randles_sevcik_analysis():
    critic = Critic()
    
    # Mocking a generated execution result of Randles-Sevcik fitting
    # Ip = 2.69e5 * n^(3/2) * A * D^(1/2) * C * v^(1/2)
    # We expect a linear fit of Ip vs sqrt(v).
    
    mock_execution_result = {
        "output": "Randles-Sevcik R^2: 0.998",
        "metrics": {
            "memory_bytes": 1024 * 1024 * 5 # 5MB
        }
    }
    
    expected_output = {
        "output": "Randles-Sevcik R^2: 0.998",
        "max_memory_bytes": 1024 * 1024 * 10 # 10MB limit
    }
    
    is_valid, msg = critic.verify(mock_execution_result, expected_output)
    
    assert is_valid == True
    assert msg == "Success"

def test_randles_sevcik_analysis_oom():
    critic = Critic()
    mock_execution_result = {
        "output": "Randles-Sevcik R^2: 0.998",
        "metrics": {
            "memory_bytes": 1024 * 1024 * 50 # 50MB (exceeds limit)
        }
    }
    expected_output = {
        "output": "Randles-Sevcik R^2: 0.998",
        "max_memory_bytes": 1024 * 1024 * 10 # 10MB limit
    }
    
    is_valid, msg = critic.verify(mock_execution_result, expected_output)
    
    assert is_valid == False
    assert "Memory footprint" in msg
