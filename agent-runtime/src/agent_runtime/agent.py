"""Agent entry point — connects to HostService and processes tasks."""

from __future__ import annotations

import asyncio
import os
from typing import Any

import structlog

log = structlog.get_logger()


class Critic:
    """Adversarial Verification (Critic) sub-model."""

    def __init__(self):
        self.validation_history = []

    def verify(
        self, execution_result: dict[str, Any], expected_output: dict[str, Any]
    ) -> tuple[bool, str]:
        """
        Verify execution result against expected physical/chemical properties,
        edge cases, and performance metrics (e.g., memory footprint).

        Returns:
            Tuple[bool, str]: (Is Valid, Error Stack/Feedback)
        """
        # 1. Verify expected output
        if execution_result.get("output") != expected_output.get("output"):
            return (
                False,
                "Error: Execution output does not match expected physics/chemistry output.",
            )

        # 2. Verify memory limits
        memory_used = execution_result.get("metrics", {}).get("memory_bytes", 0)
        if memory_used > expected_output.get("max_memory_bytes", float("inf")):
            return False, f"Error: Memory footprint ({memory_used} bytes) exceeded limits."

        # 3. Verify Edge Cases
        if "error" in execution_result:
            return False, f"Error Stack from Sandbox: {execution_result['error']}"

        return True, "Success"


import ctypes
from concurrent.futures import ProcessPoolExecutor

import grpc
import labflow_pb2
import labflow_pb2_grpc
import structlog

log = structlog.get_logger()

# Load the core-engine library for FFI
_engine_lib = None
try:
    if os.name == "nt":
        _engine_lib = ctypes.CDLL("core_engine.dll")
    else:
        _engine_lib = ctypes.CDLL("libcore_engine.so")

    class SandboxResult(ctypes.Structure):
        _fields_ = [
            ("success", ctypes.c_bool),
            ("memory_used_bytes", ctypes.c_size_t),
            ("error_msg", ctypes.c_char_p),
        ]

    _engine_lib.execute_agent_code.argtypes = [ctypes.c_char_p, ctypes.c_size_t, ctypes.c_size_t]
    _engine_lib.execute_agent_code.restype = SandboxResult
except Exception as e:
    log.warning("Could not load core_engine for sandbox execution", error=str(e))


def isolated_execute(code_bytes: bytes, max_memory: int) -> dict:
    """Runs the execution via FFI in a separate process to survive aborts."""
    if not _engine_lib:
        return {"success": False, "error": "Sandbox engine not available", "memory": 0}

    res = _engine_lib.execute_agent_code(code_bytes, len(code_bytes), max_memory)
    error_msg = res.error_msg.decode("utf-8") if res.error_msg else ""
    return {"success": res.success, "error": error_msg, "memory": res.memory_used_bytes}


class AgentServiceServicer(labflow_pb2_grpc.AgentServiceServicer):
    def __init__(self):
        self.executor = ProcessPoolExecutor(max_workers=2)

    async def ExecuteCode(self, request, context):
        log.info("ExecuteCode requested", language=request.language, memory=request.max_memory)

        # We only support WASM in this mock or compile Python to WASM here.
        # For testing, we assume the code is raw bytes or can be passed to FFI.
        code_bytes = request.code.encode("utf-8")

        loop = asyncio.get_running_loop()
        try:
            # Run in process pool to survive FFI panics (like STATUS_STACK_BUFFER_OVERRUN)
            result = await loop.run_in_executor(
                self.executor, isolated_execute, code_bytes, request.max_memory
            )
            return labflow_pb2.ExecuteCodeResponse(
                success=result["success"],
                output="",
                error=result["error"],
                memory_used_bytes=result["memory"],
            )
        except Exception as e:
            log.error("Execution worker crashed", error=str(e))
            return labflow_pb2.ExecuteCodeResponse(
                success=False,
                output="",
                error="Worker process crashed (Possible OOM/CPU limit trap)",
                memory_used_bytes=0,
            )


class Agent:
    """Agent entry point connecting to HostService via gRPC."""

    def __init__(self, host: str = "localhost:50051", server_port: int = 50052) -> None:
        self.host = host
        self.server_port = server_port
        self.channel = None
        self.stub = None
        self.server = None

    async def run(self) -> None:
        log.info("agent starting", host=self.host, port=self.server_port)

        # Start AgentService Server
        self.server = grpc.aio.server()
        labflow_pb2_grpc.add_AgentServiceServicer_to_server(AgentServiceServicer(), self.server)
        self.server.add_insecure_port(f"[::]:{self.server_port}")
        await self.server.start()

        self.channel = grpc.aio.insecure_channel(self.host)
        self.stub = labflow_pb2_grpc.HostServiceStub(self.channel)

        # Simple ping/join to verify connection with exponential backoff
        max_retries = 5
        base_delay = 1.0
        for attempt in range(max_retries):
            try:
                req = labflow_pb2.JoinRequest(session_id="agent-001", api_key="internal")
                res = await asyncio.wait_for(self.stub.JoinSession(req), timeout=5.0)
                log.info("agent joined", token=res.token)
                break
            except (grpc.aio.AioRpcError, asyncio.TimeoutError) as e:
                log.error("agent failed to join", error=str(e), attempt=attempt)
                if attempt == max_retries - 1:
                    log.error("Max retries reached. Agent failed to connect.")
                else:
                    await asyncio.sleep(base_delay * (2**attempt))

        log.info("agent ready")

        # Keep alive
        try:
            await self.server.wait_for_termination()
        except asyncio.CancelledError:
            if self.channel:
                await self.channel.close()
            if self.server:
                await self.server.stop(0)


def main() -> None:
    host = os.getenv("HOST_SERVICE_ADDR", "localhost:50051")
    agent = Agent(host=host)
    asyncio.run(agent.run())


if __name__ == "__main__":
    main()
