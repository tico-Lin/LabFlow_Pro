"""Agent entry point — connects to HostService and processes tasks."""
from __future__ import annotations

import os
import asyncio
import structlog

log = structlog.get_logger()


class Agent:
    """Minimal agent stub; replace with full gRPC client."""

    def __init__(self, host: str = "localhost:50051") -> None:
        self.host = host

    async def run(self) -> None:
        log.info("agent starting", host=self.host)
        # TODO: replace with real gRPC channel + stub
        await asyncio.sleep(0)
        log.info("agent ready")


def main() -> None:
    host = os.getenv("HOST_SERVICE_ADDR", "localhost:50051")
    agent = Agent(host=host)
    asyncio.run(agent.run())


if __name__ == "__main__":
    main()
