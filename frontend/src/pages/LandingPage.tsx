import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "3rem", textAlign: "center" }}>
      <h1>Customer Support Messaging App</h1>

      <div style={{ marginTop: "2rem" }}>
        <button
          onClick={() => navigate("/customer")}
          style={{ marginRight: "1rem" }}
        >
          Enter as Customer
        </button>

        <button onClick={() => navigate("/agent")}>
          Enter as Agent
        </button>
      </div>
    </div>
  );
}
