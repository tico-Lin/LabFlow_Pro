"""Agent entry point — connects to HostService and processes tasks."""
from __future__ import annotations

import os
import asyncio
import structlog
from typing import Dict, Any, Tuple

log = structlog.get_logger()

class Critic:
    """Adversarial Verification (Critic) sub-model."""
    
    def __init__(self):
        self.validation_history = []
        
    def verify(self, execution_result: Dict[str, Any], expected_output: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Verify execution result against expected physical/chemical properties,
        edge cases, and performance metrics (e.g., memory footprint).
        
        Returns:
            Tuple[bool, str]: (Is Valid, Error Stack/Feedback)
        """
        # 1. Verify expected output
        if execution_result.get("output") != expected_output.get("output"):
            return False, "Error: Execution output does not match expected physics/chemistry output."
            
        # 2. Verify memory limits
        memory_used = execution_result.get("metrics", {}).get("memory_bytes", 0)
        if memory_used > expected_output.get("max_memory_bytes", float('inf')):
            return False, f"Error: Memory footprint ({memory_used} bytes) exceeded limits."
            
        # 3. Verify Edge Cases
        if "error" in execution_result:
            return False, f"Error Stack from Sandbox: {execution_result['error']}"
            
        return True, "Success"

import grpc
import labflow_pb2
import labflow_pb2_grpc

class Agent:
    """Agent entry point connecting to HostService via gRPC."""

    def __init__(self, host: str = "localhost:50051") -> None:
        self.host = host
        self.channel = None
        self.stub = None

    async def run(self) -> None:
        log.info("agent starting", host=self.host)
        self.channel = grpc.aio.insecure_channel(self.host)
        self.stub = labflow_pb2_grpc.HostServiceStub(self.channel)
        
        # Simple ping/join to verify connection
        try:
            req = labflow_pb2.JoinRequest(session_id="agent-001", api_key="internal")
            res = await self.stub.JoinSession(req)
            log.info("agent joined", token=res.token)
        except grpc.aio.AioRpcError as e:
            log.error("agent failed to join", error=str(e))
        
        log.info("agent ready")

        # Keep alive
        try:
            while True:
                await asyncio.sleep(3600)
        except asyncio.CancelledError:
            if self.channel:
                await self.channel.close()


def main() -> None:
    host = os.getenv("HOST_SERVICE_ADDR", "localhost:50051")
    agent = Agent(host=host)
    asyncio.run(agent.run())


if __name__ == "__main__":
    main()
