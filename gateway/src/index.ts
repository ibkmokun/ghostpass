import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { resolveRoute } from "./routes/resolve";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

app.get("/health", (_, res: Response) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.get("/resolve/:name", resolveRoute);

app.listen(PORT, () => {
  console.log(`GhostPass Gateway listening on port ${PORT}`);
  console.log(`CORS allowed origin: ${process.env.FRONTEND_URL || "*"}`);
});
