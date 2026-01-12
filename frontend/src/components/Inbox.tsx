import { useEffect, useState } from "react";
import {
  fetchMessages,
  searchMessages,
} from "../api/messages";
import type { Message } from "../api/messages";

type Props = {
  onSelect: (message: Message) => void;
};

export default function Inbox({ onSelect }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadMessages() {
      try {
        let data;

        // Search mode
        if (searchQuery || customerFilter) {
          data = await searchMessages({
            q: searchQuery || undefined,
            customerId: customerFilter
              ? Number(customerFilter)
              : undefined,
          });
        } else {
          // Normal inbox
          data = await fetchMessages();
        }

        if (isMounted) {
          setMessages(data.messages);
        }
      } catch (e) {
        console.error("Failed to refresh inbox", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMessages();

    const interval = setInterval(loadMessages, 5000); // auto-refresh

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [searchQuery, customerFilter]);

  if (loading) {
    return <div style={{ padding: "1rem" }}>Loading inbox...</div>;
  }

  return (
    <div style={{ borderRight: "1px solid #ddd", height: "100vh" }}>
      <h3 style={{ padding: "1rem" }}>Inbox</h3>

      {/*Search UI */}
      <div style={{ padding: "0 1rem 1rem" }}>
        <input
          type="text"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "0.4rem",
            marginBottom: "0.5rem",
          }}
        />

        <input
          type="number"
          placeholder="Filter by Customer ID"
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
          style={{
            width: "100%",
            padding: "0.4rem",
          }}
        />
      </div>

      <p
        style={{
          fontSize: "0.75rem",
          color: "#777",
          paddingLeft: "1rem",
        }}
      >
        Auto-refreshing every 5s
      </p>

      {messages.length === 0 && (
        <div style={{ padding: "1rem", color: "#777" }}>
          No messages found.
        </div>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          onClick={() => onSelect(msg)}
          style={{
            padding: "1rem",
            cursor: "pointer",
            borderBottom: "1px solid #eee",
          }}
        >
          <div style={{ fontWeight: "bold" }}>
            Customer #{msg.customer.id}
          </div>

          <div
            style={{
              fontSize: "0.9rem",
              color: "#555",
              margin: "0.25rem 0",
            }}
          >
            {msg.content.slice(0, 60)}
            {msg.content.length > 60 && "..."}
          </div>

          <PriorityBadge priority={msg.priority} />
        </div>
      ))}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Message["priority"] }) {
  const colors: Record<string, string> = {
    HIGH: "red",
    MEDIUM: "orange",
    LOW: "gray",
  };

  return (
    <span
      style={{
        fontSize: "0.75rem",
        color: "white",
        background: colors[priority],
        padding: "2px 6px",
        borderRadius: "4px",
      }}
    >
      {priority}
    </span>
  );
}
