import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  fetchConversation,
  createCustomerMessage,
} from "../api/messages";
import { formatTime } from "../utils/formatTime";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  senderType: "CUSTOMER" | "AGENT";
  handledBy?: string | null;
};


export default function CustomerConversation() {
  const { customerId } = useParams();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Fetch conversation
  useEffect(() => {
  if (!customerId) return;

  const interval = setInterval(() => {
    fetchConversation(Number(customerId))
      .then((data) => setMessages(data.messages))
      .catch(console.error);
  }, 5000);

  return () => clearInterval(interval);
}, [customerId]);


  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!newMessage.trim() || !customerId) return;

    await createCustomerMessage({
      customerId: Number(customerId),
      content: newMessage,
    });

    setNewMessage("");

    const data = await fetchConversation(Number(customerId));
    setMessages(data.messages);
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Conversation with Support</h2>

      {/* Conversation */}
      <div
        style={{
          marginTop: "1rem",
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: "10px",
          background: "#f5f7fa",
          height: "60vh",
          overflowY: "auto",
        }}
      >
        {messages.map((msg) => {
          const isCustomer = msg.senderType === "CUSTOMER";

          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: isCustomer ? "flex-end" : "flex-start",
                marginBottom: "0.8rem",
              }}
            >
              <div
                style={{
                  background: isCustomer ? "#DCF8C6" : "#FFFFFF",
                  padding: "0.6rem 0.8rem",
                  borderRadius: "12px",
                  maxWidth: "65%",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ fontSize: "0.9rem" }}>
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

      {/* Send message */}
      <div style={{ marginTop: "1rem" }}>
        <textarea
          rows={3}
          style={{ width: "100%" }}
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />

        <button
          onClick={handleSend}
          style={{ marginTop: "0.5rem" }}
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
