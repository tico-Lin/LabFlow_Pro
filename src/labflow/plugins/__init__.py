"""
插件系統套件，負責動態載入與管理外部功能。
"""

from labflow.plugins.base import Plugin
from labflow.plugins.manager import PluginManager

__all__ = ["Plugin", "PluginManager"]
