import { prisma } from "../db/prisma";
import { generateReply } from "./llmService";

export async function processMessage(message: string, sessionId?: string) {
  let conversationId = sessionId;

  if (!conversationId) {
    const conv = await prisma.conversation.create({ data: {} });
    conversationId = conv.id;
  } else {
    // Ensure conversation exists
    const exists = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!exists) {
      const conv = await prisma.conversation.create({ data: { id: conversationId } }); // Reuse ID if possible or just create new
      conversationId = conv.id;
      // Note: If ID was invalid UUID from client, prisma might throw. 
      // Ideally we checks validation before. For now assume valid UUID or null.
    }
  }

  // 1. Save User Message
  await prisma.message.create({
    data: { conversationId, sender: "user", text: message }
  });

  // 2. Fetch recent history for Context
  const historyRecords = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" }, // Get latest first
    take: 10
  });

  // Reverse to chronological order for LLM
  const history = historyRecords.reverse().map(m => ({
    role: m.sender === "user" ? "user" : "assistant",
    content: m.text
  }));

  // 3. Generate Reply
  const reply = await generateReply(history, message);

  // 4. Save AI Message
  await prisma.message.create({
    data: { conversationId, sender: "ai", text: reply }
  });

  return { reply, sessionId: conversationId };
}

export async function getConversationHistory(sessionId: string) {
  const history = await prisma.message.findMany({
    where: { conversationId: sessionId },
    orderBy: { createdAt: "asc" },
    select: {
      sender: true,
      text: true,
      createdAt: true
    }
  });

  return history.map(h => ({
    sender: h.sender,
    text: h.text,
    timestamp: h.createdAt
  }));
}
