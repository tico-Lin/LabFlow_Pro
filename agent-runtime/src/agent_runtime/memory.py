import sqlite3
import json
from typing import List, Dict, Any, Optional

class MemoryManager:
    def __init__(self, db_path: str = "agent_memory.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS memory (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_context TEXT NOT NULL,
                    code_proposal TEXT NOT NULL,
                    feedback TEXT NOT NULL,
                    is_accepted BOOLEAN NOT NULL,
                    metrics TEXT
                )
            ''')
            conn.commit()

    def add_experience(self, task: str, code: str, feedback: str, is_accepted: bool, metrics: dict):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO memory (task_context, code_proposal, feedback, is_accepted, metrics) VALUES (?, ?, ?, ?, ?)",
                (task, code, feedback, is_accepted, json.dumps(metrics))
            )
            conn.commit()

    def get_negative_experiences(self, task_keyword: str, limit: int = 5) -> List[Dict[str, Any]]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "SELECT code_proposal, feedback FROM memory WHERE is_accepted = 0 AND task_context LIKE ? ORDER BY id DESC LIMIT ?",
                (f"%{task_keyword}%", limit)
            )
            return [{"code": row[0], "feedback": row[1]} for row in cursor.fetchall()]

class PromptOptimizer:
    def __init__(self, memory_manager: MemoryManager):
        self.memory = memory_manager

    def optimize_prompt(self, base_prompt: str, task_keyword: str) -> str:
        negatives = self.memory.get_negative_experiences(task_keyword)
        if not negatives:
            return base_prompt
        
        optimized = base_prompt + "\n\n### CRITICAL CONSTRAINTS FROM PAST FAILURES ###\n"
        optimized += "The following approaches have failed or were rejected by the user/critic. DO NOT repeat them:\n"
        
        for idx, neg in enumerate(negatives):
            optimized += f"\n[Failure {idx+1}]\nCode Attempted:\n{neg['code']}\nFeedback/Error:\n{neg['feedback']}\n"
            
        optimized += "\nEnsure your new solution avoids these pitfalls and completely resolves the Feedback provided."
        return optimized
