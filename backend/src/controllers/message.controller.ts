import { Request, Response } from "express";
import prisma from "../prisma/client";
import { evaluatePriority } from "../utils/priorityEngine";

/**
 * Inbox list
 */
export async function getMessages(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        orderBy: [
          { priorityScore: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              assignedAgent: true,
            },
          },
        },
      }),
      prisma.message.count(),
    ]);

    res.json({ page, limit, total, messages });
  } catch (error) {
    console.error("Failed to fetch messages", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Single message
 */
export async function getMessageById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            assignedAgent: true,
          },
        },
      },
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json(message);
  } catch (error) {
    console.error("Failed to fetch message", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Search
 */
export async function searchMessages(req: Request, res: Response) {
  try {
    const { q, customerId } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (q) {
      where.content = {
        contains: String(q),
        mode: "insensitive",
      };
    }

    if (customerId) {
      where.customerId = Number(customerId);
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              assignedAgent: true,
            },
          },
        },
      }),
      prisma.message.count({ where }),
    ]);

    res.json({ page, limit, total, messages });
  } catch (error) {
    console.error("Search failed", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Agent replies
 */
export async function replyToMessage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Reply content is required" });
    }

    const originalMessage = await prisma.message.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!originalMessage) {
      return res.status(404).json({ error: "Original message not found" });
    }

    if (!originalMessage.customer.assignedAgent) {
      return res.status(409).json({
        error: "Customer must be claimed before replying",
      });
    }

    const evaluation = evaluatePriority(content);

    const reply = await prisma.message.create({
      data: {
        customerId: originalMessage.customerId,
        content,
        createdAt: new Date(),

        senderType: "AGENT",

        priority: evaluation.priority,
        priorityScore: evaluation.score,
        priorityReason: evaluation.reason,
      },
    });

    res.status(201).json(reply);
  } catch (error) {
    console.error("Failed to send reply", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Claim customer (ownership)
 */
export async function claimMessage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { agent } = req.body;

    if (!agent) {
      return res.status(400).json({ error: "Agent name is required" });
    }

    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: message.customerId },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    if (customer.assignedAgent) {
      return res.status(409).json({
        error: "Customer already claimed",
        assignedAgent: customer.assignedAgent,
      });
    }

    const updated = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        assignedAgent: agent,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Failed to claim customer", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Customer message ingest
 */

export async function createCustomerMessage(req: Request, res: Response) {
  try {
    const { customerId, content } = req.body;

    if (!customerId || !content) {
      return res.status(400).json({ error: "customerId and content required" });
    }

    // 🔹 Ensure customer exists (create if new)
    await prisma.customer.upsert({
      where: { id: customerId },
      update: {},
      create: { id: customerId },
    });

    const evaluation = evaluatePriority(content);

    const message = await prisma.message.create({
      data: {
        customerId,
        content,
        createdAt: new Date(),
        senderType: "CUSTOMER",
        priority: evaluation.priority,
        priorityScore: evaluation.score,
        priorityReason: evaluation.reason,
      },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Failed to create customer message", error);
    res.status(500).json({ error: "Internal server error" });
  }
}


/**
 * Conversation view
 */


export async function getCustomerConversation(req: Request, res: Response) {
  try {
    const customerId = Number(req.params.customerId);

    if (isNaN(customerId)) {
      return res.status(400).json({ error: "Invalid customerId" });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!customer) {
      return res.json({
        customer: {
          id: customerId,
          totalMessages: 0,
          highPriorityCount: 0,
          assignedAgent: null,
        },
        messages: [],
      });
    }

    const highPriorityCount = customer.messages.filter(
      (m) => m.priority === "HIGH"
    ).length;

    res.json({
      customer: {
        id: customer.id,
        totalMessages: customer.messages.length,
        highPriorityCount,
        assignedAgent: customer.assignedAgent,
      },
      messages: customer.messages.map((m) => ({
        id: m.id,
        content: m.content,
        createdAt: m.createdAt,
        senderType: m.senderType,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch conversation", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
