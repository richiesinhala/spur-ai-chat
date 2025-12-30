import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// IMPORTANT: In ESM builds, compiled path becomes .js
import chatRouter from "./routes/chat.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/chat", chatRouter);

// Health check for Render
app.get("/healthz", (_, res) => res.status(200).send("OK"));

app.get("/", (_, res) => res.send("Spur Backend Running"));

// IMPORTANT — Render assigns PORT dynamically
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
