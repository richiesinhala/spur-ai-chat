import { Request, Response } from "express";
import { chatMessageSchema, sessionIdSchema } from "../utils/validation";
import { processMessage, getConversationHistory } from "../services/chatService";

export async function sendMessage(req: Request, res: Response) {
    try {
        const validation = chatMessageSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({ error: validation.error.errors[0].message });
        }

        const { message, sessionId } = validation.data;
        const result = await processMessage(message, sessionId || undefined);

        res.json(result);
    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({ reply: "Sorry, I encountered an error processing your message." });
    }
}

export async function getHistory(req: Request, res: Response) {
    try {
        const validation = sessionIdSchema.safeParse(req.params);

        if (!validation.success) {
            return res.status(400).json({ error: validation.error.errors[0].message });
        }

        const { sessionId } = validation.data;
        const history = await getConversationHistory(sessionId);

        res.json(history);
    } catch (error) {
        console.error("Error in getHistory:", error);
        res.status(500).json({ error: "Failed to retrieve history" });
    }
}
