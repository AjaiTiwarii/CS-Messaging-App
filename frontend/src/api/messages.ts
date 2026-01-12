// ---------- Types ----------

export type Message = {
  id: string;
  content: string;
  createdAt: string;

  priority: "LOW" | "MEDIUM" | "HIGH";
  priorityScore: number;
  priorityReason?: string | null;

  customer: {
    id: number;
    assignedAgent?: string | null;
  };
};


export type ConversationMessage = {
  id: string;
  content: string;
  createdAt: string;
  senderType: "CUSTOMER" | "AGENT";
  handledBy?: string | null;
};


export type CustomerContext = {
  id: number;
  totalMessages: number;
  highPriorityCount: number;
  assignedAgent: string | null;
};


// ---------- API Calls ----------

export async function fetchMessages() {
  const res = await fetch("http://localhost:4000/api/messages");
  if (!res.ok) {
    throw new Error("Failed to fetch messages");
  }
  return res.json();
}

export async function sendReply(messageId: string, content: string) {
  const res = await fetch(
    `http://localhost:4000/api/messages/${messageId}/reply`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    }
  );

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to send reply");
  }

  return res.json();
}

export async function claimMessage(messageId: string, agent: string) {
  const res = await fetch(
    `http://localhost:4000/api/messages/${messageId}/claim`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ agent }),
    }
  );

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to claim conversation");
  }

  return res.json();
}

export async function fetchConversation(customerId: number) {
  const res = await fetch(
    `http://localhost:4000/api/messages/customer/${customerId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch conversation");
  }

  return res.json();
}



export async function createCustomerMessage(data: {
  customerId: number;
  content: string;
}) {
  const res = await fetch("http://localhost:4000/api/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to send message");
  }

  return res.json();
}

export async function searchMessages(params: {
  q?: string;
  customerId?: number;
}) {
  const query = new URLSearchParams();

  if (params.q) query.append("q", params.q);
  if (params.customerId)
    query.append("customerId", String(params.customerId));

  const res = await fetch(
    `http://localhost:4000/api/messages/search?${query.toString()}`
  );

  if (!res.ok) {
    throw new Error("Search failed");
  }

  return res.json();
}

