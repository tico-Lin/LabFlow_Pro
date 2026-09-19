"""
應用程式進入點模組 (Application Entry Point)

負責初始化系統環境、內核、使用者介面，並啟動事件迴圈。
"""

import sys
import logging
from pathlib import Path
from typing import Any

from PySide6.QtWidgets import QApplication
from PySide6.QtGui import QPalette, QColor
from PySide6.QtCore import Qt

def setup_logging() -> None:
    """設定應用程式日誌 (Console + File)。"""
    log_file = Path("labflow.log")
    handlers = [logging.FileHandler(log_file, encoding="utf-8")]
    if sys.stdout is not None:
        handlers.append(logging.StreamHandler(sys.stdout))
        
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=handlers
    )

def apply_dark_theme(app: QApplication) -> None:
    """套用深色主題。"""
    app.setStyle("Fusion")
    dark_palette = QPalette()
    dark_palette.setColor(QPalette.ColorRole.Window, QColor(53, 53, 53))
    dark_palette.setColor(QPalette.ColorRole.WindowText, Qt.GlobalColor.white)
    dark_palette.setColor(QPalette.ColorRole.Base, QColor(25, 25, 25))
    dark_palette.setColor(QPalette.ColorRole.AlternateBase, QColor(53, 53, 53))
    dark_palette.setColor(QPalette.ColorRole.ToolTipBase, Qt.GlobalColor.white)
    dark_palette.setColor(QPalette.ColorRole.ToolTipText, Qt.GlobalColor.white)
    dark_palette.setColor(QPalette.ColorRole.Text, Qt.GlobalColor.white)
    dark_palette.setColor(QPalette.ColorRole.Button, QColor(53, 53, 53))
    dark_palette.setColor(QPalette.ColorRole.ButtonText, Qt.GlobalColor.white)
    dark_palette.setColor(QPalette.ColorRole.BrightText, Qt.GlobalColor.red)
    dark_palette.setColor(QPalette.ColorRole.Link, QColor(42, 130, 218))
    dark_palette.setColor(QPalette.ColorRole.Highlight, QColor(42, 130, 218))
    dark_palette.setColor(QPalette.ColorRole.HighlightedText, Qt.GlobalColor.black)
    app.setPalette(dark_palette)
    app.setStyleSheet("QToolTip { color: #ffffff; background-color: #2a82da; border: 1px solid white; }")


def main() -> int:
    """
    應用程式主函數。
    """
    setup_logging()
    logger = logging.getLogger(__name__)
    logger.info("Starting LabFlow Pro...")

    # Create Qt Application FIRST
    app = QApplication(sys.argv)
    app.setApplicationName("LabFlow Pro")
    app.setApplicationVersion("1.0.0")
    app.setOrganizationName("LabFlow Team")
    apply_dark_theme(app)

    # PyInstaller path resolution
    if getattr(sys, 'frozen', False):
        base_path = Path(sys._MEIPASS)
    else:
        base_path = Path(__file__).parent.parent.parent

    # Initialize Core Kernel
    from labflow.core.kernel import Kernel
    from labflow.i18n.translator import Translator
    from labflow.engine.dispatcher import ComputeDispatcher
    from labflow.plugins.manager import PluginManager
    
    kernel = Kernel()
    try:
        config_path = base_path / "config" / "default.toml"
        kernel.boot(config_path if config_path.exists() else None)
        
        # Initialize Translator
        translator = Translator.instance()
        translator._locales_dir = base_path / "locales"
        translator.set_locale(kernel.get_config().locale)
        
    except Exception as e:
        logger.error(f"Failed to boot kernel: {e}")
        return 1
        
    # Start engine dispatcher
    dispatcher = ComputeDispatcher(kernel.get_event_bus())
    
    # Load plugins
    plugin_manager = PluginManager(kernel)
    plugin_dir = base_path / "plugins_example"
    if plugin_dir.exists():
        plugin_manager.load_plugins(plugin_dir)
    
    # Import and create MainWindow
    try:
        from labflow.ui.main_window import MainWindow
        from labflow.api.context import LabFlowContext
        
        ctx = LabFlowContext(kernel)
        
        window = MainWindow()
        window.setup(kernel)
        window.resize(1280, 800)
        
        # Inject context to PythonConsole
        if hasattr(window, 'console_widget') and hasattr(window.console_widget, 'setup_environment'):
            window.console_widget.setup_environment(ctx)
            
        window.show()
    except Exception as e:
        logger.error(f"MainWindow load failed: {e}", exc_info=True)
        return 1

    # Run Event Loop
    exit_code = app.exec()
    
    # Shutdown gracefully
    logger.info("Shutting down LabFlow Pro...")
    dispatcher.shutdown()
    kernel.shutdown()
    
    return exit_code

if __name__ == "__main__":
    sys.exit(main())
