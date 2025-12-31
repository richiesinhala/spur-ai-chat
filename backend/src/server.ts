import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import chatRouter from "./routes/chat";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/chat", chatRouter);

// Health Check
app.get("/healthz", (_, res) => res.send("OK"));
app.get("/", (_, res) => res.send("Spur Backend Running"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
