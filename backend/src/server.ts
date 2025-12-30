
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import chatRouter from "./routes/chat";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/chat", chatRouter);

app.get("/", (_,res)=>res.send("Spur Backend Running"));

app.listen(3000, () => console.log("Backend running on 3000"));
