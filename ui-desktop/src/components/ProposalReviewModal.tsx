import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function ProposalReviewModal({
  proposal,
  onResolve,
}: {
  proposal: string;
  onResolve: () => void;
}) {
  const [feedback, setFeedback] = useState("");

  const handleApprove = async () => {
    await invoke("approve_proposal", { proposal });
    onResolve();
  };

  const handleReject = async () => {
    await invoke("reject_proposal", { proposal, feedback });
    onResolve();
  };

  return (
    <div className="modal">
      <h3>Review Agent Proposal</h3>
      <pre>{proposal}</pre>
      <textarea
        placeholder="If rejecting, explain why so the agent can optimize its prompt..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />
      <div>
        <button onClick={handleApprove}>Approve</button>
        <button onClick={handleReject}>Reject</button>
      </div>
    </div>
  );
}
