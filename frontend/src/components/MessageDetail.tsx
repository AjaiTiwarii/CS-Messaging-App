import { useEffect, useState, useRef } from "react";
import type { Message } from "../api/messages";
import {
  sendReply,
  claimMessage,
  fetchConversation,
  type ConversationMessage,
} from "../api/messages";
import { cannedMessages } from "../constants/cannedMessages";
import { formatTime } from "../utils/formatTime";
import { getAgentName } from "../utils/agent";

type Props = {
  message: Message;
  onReplySent: () => void;
};

export default function MessageDetail({ message, onReplySent }: Props) {
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Agent identity (stored in localStorage / utils)
  const agentName = getAgentName();

  // Ownership is determined ONLY by customer.assignedAgent
  const assignedAgent = message.customer.assignedAgent;
  const isClaimed = Boolean(assignedAgent);
  const isClaimedByMe = Boolean(agentName && assignedAgent === agentName);

  // Load conversation
  useEffect(() => {
    fetchConversation(message.customer.id)
      .then((data) => setConversation(data.messages))
      .catch(console.error);
  }, [message.customer.id]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  async function refreshConversation() {
    const data = await fetchConversation(message.customer.id);
    setConversation(data.messages);
  }

  async function handleSend() {
    if (!reply.trim() || !agentName || !isClaimedByMe) return;

    setSending(true);
    try {
      await sendReply(message.id, reply);
      setReply("");
      await refreshConversation();
      onReplySent(); // refresh inbox + selected message
    } finally {
      setSending(false);
    }
  }

  async function handleClaim() {
    if (!agentName) return;

    setClaiming(true);
    try {
      await claimMessage(message.id, agentName);
      onReplySent(); // critical: refresh message ownership in inbox
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <h2>Customer #{message.customer.id}</h2>

      <p>
        <b>Priority:</b> {message.priority}
      </p>

      {message.priorityReason && (
        <p style={{ color: "#555" }}>
          <b>Why:</b> {message.priorityReason}
        </p>
      )}

      {/* Agent identity warning */}
      {!agentName && (
        <p style={{ color: "red" }}>
          No agent name set. Please re-enter as agent.
        </p>
      )}

      {/* Ownership status */}
      {!isClaimed && (
        <p style={{ color: "#999" }}>This conversation is unassigned</p>
      )}

      {isClaimed && (
        <p style={{ color: "#555" }}>
          Handled by <b>{assignedAgent}</b>
          {isClaimedByMe && " (You)"}
        </p>
      )}

      {isClaimed && !isClaimedByMe && (
        <p style={{ color: "#c0392b" }}>
          This conversation is being handled by another agent
        </p>
      )}

      <hr />

      {/* Conversation */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
          background: "#f5f7fa",
          borderRadius: "10px",
          border: "1px solid #e0e0e0",
          marginBottom: "1rem",
        }}
      >
        {conversation.map((msg) => {
          const isAgent = msg.senderType === "AGENT";

          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: isAgent ? "flex-end" : "flex-start",
                marginBottom: "0.8rem",
              }}
            >
              <div
                style={{
                  background: isAgent ? "#DCF8C6" : "#FFFFFF",
                  padding: "0.6rem 0.8rem",
                  borderRadius: "12px",
                  maxWidth: "65%",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#555",
                    marginBottom: "0.25rem",
                  }}
                >
                  {isAgent ? assignedAgent || "Agent" : "Customer"}
                </div>

                <div style={{ fontSize: "0.9rem", color: "#222" }}>
                  {msg.content}
                </div>

                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#777",
                    marginTop: "4px",
                    textAlign: "right",
                  }}
                >
                  {formatTime(msg.createdAt)}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <hr />

      {/* Claim */}
      {!isClaimed && (
        <button
          onClick={handleClaim}
          disabled={claiming || !agentName}
        >
          {claiming ? "Claiming..." : "Claim Conversation"}
        </button>
      )}

      {/* Reply */}
      <label>Canned Responses:</label>
      <select
        onChange={(e) => setReply(e.target.value)}
        defaultValue=""
        disabled={!isClaimedByMe || sending}
      >
        <option value="" disabled>
          Select a canned message
        </option>
        {cannedMessages.map((c) => (
          <option key={c.label} value={c.content}>
            {c.label}
          </option>
        ))}
      </select>

      <textarea
        rows={3}
        style={{ width: "100%", marginTop: "0.5rem" }}
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder={
          isClaimedByMe
            ? "Type your reply..."
            : "Claim this conversation to reply"
        }
        disabled={!isClaimedByMe}
      />

      <button
        onClick={handleSend}
        disabled={sending || !isClaimedByMe}
        style={{ marginTop: "0.5rem" }}
      >
        {sending ? "Sending..." : "Send Reply"}
      </button>
    </div>
  );
}
