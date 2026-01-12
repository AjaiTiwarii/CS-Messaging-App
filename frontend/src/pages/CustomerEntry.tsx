import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CustomerEntry() {
  const [customerId, setCustomerId] = useState("");
  const navigate = useNavigate();

  function handleContinue() {
    if (!customerId.trim()) return;
    navigate(`/customer/${customerId}`);
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Enter as Customer</h2>

      <input
        type="number"
        placeholder="Customer ID"
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
      />

      <br /><br />

      <button onClick={handleContinue}>
        View Conversation
      </button>
    </div>
  );
}
