import { z } from "zod";

export const chatMessageSchema = z.object({
    message: z.string().min(1, "Message cannot be empty").max(1000, "Message too long"),
    sessionId: z.string().nullable().optional()
});

export const sessionIdSchema = z.object({
    sessionId: z.string().min(1, "Session ID is required")
});
