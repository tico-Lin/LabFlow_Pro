from typing import List, Dict, Any, Tuple
from agent_runtime.agent import Critic
from agent_runtime.memory import MemoryManager, PromptOptimizer
import asyncio

class ConsensusEngine:
    def __init__(self, memory: MemoryManager):
        self.memory = memory
        self.optimizer = PromptOptimizer(memory)
        self.critic = Critic()
        self.max_retries = 3

    async def _mock_generate_proposals(self, prompt: str) -> List[str]:
        # In a real system, this calls multiple LLMs in parallel
        # For mock MVP, we return a few variations of code
        return [
            "# Proposal 1: Numpy Polyfit\nimport numpy as np\ndef analyze(x, y): return np.polyfit(x, y, 1)",
            "# Proposal 2: Scipy Curve Fit\nfrom scipy.optimize import curve_fit\ndef analyze(x, y): return 1",
            "# Proposal 3: Flawed Code\nimport sys\ndef analyze(x): sys.exit(1)"
        ]

    async def _mock_run_in_sandbox(self, code: str) -> Dict[str, Any]:
        # Mock execution logic
        if "sys.exit" in code:
            return {"output": None, "error": "Exception: sys.exit called", "metrics": {"memory_bytes": 100}}
        return {"output": "R^2: 0.95", "metrics": {"memory_bytes": 500000}}

    async def generate_and_vote(self, base_task: str, task_keyword: str) -> Tuple[Optional[str], str]:
        for attempt in range(self.max_retries):
            # 1. Optimize prompt based on past failures
            optimized_prompt = self.optimizer.optimize_prompt(base_task, task_keyword)
            
            # 2. Generate multiple proposals
            proposals = await self._mock_generate_proposals(optimized_prompt)
            
            best_code = None
            best_score = -1
            feedback_log = []

            # 3. Blind Review & Sandbox Execution
            for code in proposals:
                # Execute in sandbox
                exec_result = await self._mock_run_in_sandbox(code)
                
                if "error" in exec_result:
                    score = 0
                    feedback_log.append(exec_result["error"])
                else:
                    # Critic evaluates
                    is_valid, msg = self.critic.verify(exec_result, {"output": "R^2: 0.95", "max_memory_bytes": 1024*1024})
                    if is_valid:
                        score = 100 # In real scenario, combine with LLM evaluator scores
                        best_code = code
                        best_score = score
                        break
                    else:
                        feedback_log.append(msg)

            if best_code and best_score >= 80:
                # We have a consensus winner
                return best_code, "Consensus Reached"
            
            # 4. Total Failure: Record negative experience and retry
            print(f"Attempt {attempt+1} failed. Consolidating feedback...")
            for idx, code in enumerate(proposals):
                fb = feedback_log[idx] if idx < len(feedback_log) else "Unknown failure"
                self.memory.add_experience(task_keyword, code, fb, False, {})
                
        return None, "Failed to reach consensus after max retries. All proposals rejected."
