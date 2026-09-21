import pytest
from agent_runtime.consensus import ConsensusEngine
from agent_runtime.memory import MemoryManager


@pytest.mark.asyncio
async def test_consensus_voting_and_retries():
    # Setup temporary memory DB
    memory = MemoryManager(":memory:")
    engine = ConsensusEngine(memory)

    # Run consensus on a mock task
    # The mock will fail for sys.exit, but R^2=0.95 will pass critic
    best_code, msg = await engine.generate_and_vote("Analyze XPS data", "XPS")

    # It should reach consensus since Proposal 1 and 2 don't contain sys.exit
    assert best_code is not None
    assert "Consensus Reached" in msg


@pytest.mark.asyncio
async def test_consensus_max_retries():
    memory = MemoryManager(":memory:")
    engine = ConsensusEngine(memory)

    # Mock to force all to fail
    async def mock_fail_all(prompt):
        return ["import sys\ndef analyze(x): sys.exit(1)"] * 3

    engine._mock_generate_proposals = mock_fail_all

    best_code, msg = await engine.generate_and_vote("Impossible task", "Impossible")

    assert best_code is None
    assert "Failed to reach consensus after max retries" in msg

    # Check if memory recorded the negative experiences
    negatives = memory.get_negative_experiences("Impossible")
    assert len(negatives) == 3 * engine.max_retries  # 3 proposals * 3 retries
