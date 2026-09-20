import pytest
import numpy as np
import sys
import os

# Add src to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

from agent_runtime.analysis import find_max_peak

def test_large_array_memory_and_performance():
    """Edge case: extremely large array to ensure numpy handles it efficiently."""
    # 10 million data points
    N = 10_000_000
    voltages = np.linspace(0, 100, N).tolist()
    # Base noise
    currents = np.random.rand(N)
    # Inject a distinct peak
    peak_index = 5_000_000
    currents[peak_index] = 9999.9
    currents = currents.tolist()
    
    # Must run in reasonable time and memory
    result = find_max_peak(voltages, currents)
    
    assert result["index"] == peak_index
    assert result["current"] == 9999.9
    assert result["voltage"] == voltages[peak_index]


