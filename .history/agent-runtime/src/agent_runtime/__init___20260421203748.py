"""LabFlow agent-runtime package."""

from __future__ import annotations

__all__ = ["Agent"]
__version__ = "0.1.0"


def __getattr__(name: str):
	if name == "Agent":
		from .agent import Agent

		return Agent

	raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
