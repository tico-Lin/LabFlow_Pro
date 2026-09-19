"""
LabFlow Pro - Baseline Subtraction Plugin Example
"""
from typing import TYPE_CHECKING
import numpy as np

if TYPE_CHECKING:
    from labflow.api.context import LabFlowContext

class BaselineSubtractionPlugin:
    """
    示範如何使用 LabFlowContext 取得資料、執行運算、以及繪圖。
    """
    
    @property
    def name(self) -> str:
        return "Baseline Subtraction Demo"
        
    @property
    def version(self) -> str:
        return "1.0.0"
        
    @property
    def description(self) -> str:
        return "示範從資料庫取得光譜，執行 Shirley 基線校正，並繪製結果。"
        
    def execute(self, ctx: 'LabFlowContext') -> None:
        print(f"正在執行插件: {self.name}")
        
        # 1. 取得資料 (模擬)
        # 在實際使用中，這裡會是實際的路徑，例如 "/Folder1/Book1/Sheet1/A"
        try:
            # 假設這是一個真實的路徑，如果找不到資料，我們就在這裡產生一些模擬資料
            y_data = ctx.get_dataset("/Sample/XPS/Intensity")
        except Exception:
            print("找不到資料，建立模擬 XPS 資料...")
            x = np.linspace(0, 100, 100)
            y_data = np.zeros_like(x)
            y_data[50:] = 10.0
            y_data += np.random.normal(0, 0.1, 100)
        
        # 2. 呼叫引擎執行分析
        print("執行 Shirley 基線校正...")
        result = ctx.run_analysis(
            func_name="shirley_baseline",
            data=y_data,
            max_iterations=50,
            tolerance=1e-4
        )
        
        # result.data 是扣除基線後的純訊號
        # result.metadata['baseline'] 是算出的基線
        pure_signal = result.data
        baseline = result.metadata.get('baseline')
        
        print(f"校正完成。耗時: {result.execution_time_ms:.2f} ms")
        
        # 3. 呼叫繪圖 (發送事件給 UI 進行渲染，不會阻塞線程)
        print("發送繪圖請求到 Layer 0...")
        ctx.plot(y_data, target_layer=0, plot_type="scatter")
        
        if baseline is not None:
            print("將計算出的基線繪製到同一 Layer...")
            ctx.plot(baseline, target_layer=0, plot_type="line")
            
        print("將扣除基線後的純訊號繪製到 Layer 1...")
        ctx.plot(pure_signal, target_layer=1, plot_type="line")
        
        print("插件執行完畢！")

