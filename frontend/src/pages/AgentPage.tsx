import { useState } from "react";
import Inbox from "../components/Inbox";
import MessageDetail from "../components/MessageDetail";
import AgentEntry from "../components/AgentEntry";
import type { Message } from "../api/messages";
import { getAgentName } from "../utils/agent";

export default function AgentPage() {
  const [selected, setSelected] = useState<Message | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const agentName = getAgentName();

  // Gate agent UI
  if (!agentName) {
    return <AgentEntry onDone={() => window.location.reload()} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "35%", borderRight: "1px solid #e0e0e0" }}>
        <Inbox
          key={refreshKey}
          onSelect={setSelected}
        />
      </div>

      <div style={{ flex: 1, padding: "1.5rem" }}>
        {selected ? (
          <MessageDetail
            message={selected}
            onReplySent={() => {
              setRefreshKey((k) => k + 1);
              setSelected(null);
            }}
          />
        ) : (
          <div style={{ color: "#777" }}>
            Select a message from the inbox
          </div>
        )}
      </div>
    </div>
  );
}
