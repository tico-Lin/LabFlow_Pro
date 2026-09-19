# LabFlow Pro

LabFlow Pro is a modern, high-performance scientific data visualization and analysis software. It merges the layered graphing concepts of legacy tools (like Origin Pro) with a fully decoupled MVVM architecture, Python plugin extensibility, and native HDF5 data management.

## Project Architecture
- **Core Kernel**: Thread-safe EventBus and immutable AppState management.
- **Data Layer**: HDF5-backed chunked arrays loaded lazily via QAbstractTableModel.
- **Computation Engine**: Pure functions executed asynchronously via ThreadPoolExecutor (non-blocking). Supports FFT, Shirley/Tougaard baselines, multi-peak fitting (Levenberg-Marquardt), and interpolation.
- **Presentation Layer**: PySide6 MDI application with PyQtGraph layered visualization.
- **Plugin System**: Dynamically loaded Python extensions utilizing a safe `LabFlowContext` API.

## Requirements
- Python 3.10+ (x64)
- dependencies: `numpy`, `scipy`, `h5py`, `PySide6`, `pyqtgraph`

## Development Mode
To run the application locally from the source code:

1. Create a virtual environment and install dependencies:
```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

2. Run the application entry point:
```bash
python src/labflow/app.py
```
*(Or run `python -m labflow` from the `src` directory)*

3. Run tests:
```bash
pytest tests/ -v
```

## Packaging & Building (.exe)
LabFlow Pro can be packaged into a standalone Windows executable using `PyInstaller`. A build script is provided to automatically configure the necessary hidden imports and resource paths (such as `locales/` for i18n).

To compile the project:
```bash
python build.py
```
The resulting executable will be placed in the `dist/` directory.

## Plugin Quick-Start Guide
Users can extend LabFlow Pro by writing Python scripts and placing them in the `plugins_example/` directory. The internal API provides a safe facade (`LabFlowContext`) for data interaction and asynchronous plotting.

### Example: Shirley Baseline Subtraction
```python
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from labflow.api.context import LabFlowContext

class BaselineSubtractionPlugin:
    @property
    def name(self) -> str: return "Baseline Subtraction Demo"
    @property
    def version(self) -> str: return "1.0.0"
        
    def execute(self, ctx: 'LabFlowContext') -> None:
        # Fetch raw data
        y_data = ctx.get_dataset("/Sample/XPS/Intensity")
        
        # Trigger asynchronous engine computation
        result = ctx.run_analysis(
            func_name="shirley_baseline",
            data=y_data,
            max_iterations=50,
            tolerance=1e-4
        )
        pure_signal = result.data
        baseline = result.metadata.get('baseline')
        
        # Layered Plotting (emits EventBus commands, non-blocking UI)
        ctx.plot(y_data, target_layer=0, plot_type="scatter")      # Raw data on Layer 0
        ctx.plot(baseline, target_layer=0, plot_type="line")       # Fitted baseline overlaid on Layer 0
        ctx.plot(pure_signal, target_layer=1, plot_type="line")    # Processed signal separated on Layer 1
```

You can also run similar Python commands directly in the **Interactive Python Console** dock within the application!
