import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a helpful support agent for "Spur Mart", an e-commerce store.

**Store Policies:**
*   **Shipping:** Worldwide shipping available. 5-9 business days for international, 2-4 days for domestic.
*   **Returns:** 30-day return policy for unused items. Refunds processed in 5-7 business days.
*   **Support:** Mon-Sat, 9AM - 6PM IST. Email: support@spurmart.com.

**Guidelines:**
*   Be concise, polite, and professional.
*   If unsure about a policy not listed here, say you are not sure and suggest contacting support.
*   Do not make up facts.`;

export async function generateReply(history: { role: string; content: string }[], userMessage: string) {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // Optimized model
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.map(h => ({ role: h.role as "user" | "assistant", content: h.content })),
        { role: "user", content: userMessage }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });
    return response.choices[0].message.content || "I couldn't generate a response.";
  } catch (err: any) {
    console.error("LLM API Error:", err);
    if (err.code === 'insufficient_quota') {
      return "I am currently out of service due to quota limits. Please try again later.";
    }
    return "I'm having trouble connecting to my brain right now. Please try again.";
  }
}
