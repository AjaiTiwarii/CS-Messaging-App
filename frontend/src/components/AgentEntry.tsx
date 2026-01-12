import { useState } from "react";
import { setAgentName } from "../utils/agent";

export default function AgentEntry({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");

  function handleContinue() {
    if (!name.trim()) return;
    setAgentName(name.trim());
    onDone();
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Enter as Agent</h2>

      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: "0.5rem", width: "250px" }}
      />

      <br /><br />

      <button onClick={handleContinue}>
        Continue
      </button>
    </div>
  );
}
