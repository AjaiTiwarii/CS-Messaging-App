import express from "express";
import cors from "cors";

import messageRoutes from "./routes/message.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

import { Request, Response } from "express";

app.get("/", (_req: Request, res: Response) => {
  res.send("Server running");
});


// Message APIs
app.use("/api/messages", messageRoutes);

export default app;
