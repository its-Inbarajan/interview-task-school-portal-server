import { createServer } from "node:http";
import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db";
import bodyParser from "body-parser";
import { GlobalError } from "./middleware/global-error";
import userRoter from "./routes/auth.router";

// Configs
dotenv.config();
const app = express();
const httpServer = createServer(app);
const corsOptions: CorsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
app.use(bodyParser.json());
app.use(cors(corsOptions));

//Health check
app.use("/check", (req: Request, res: Response) => {
  res.status(200).json({ message: "Server running successfully!" });
});

// APIs

app.use("/api/auth", userRoter);

// Global Error handler
app.use(GlobalError);

connectDB().then(() => {
  httpServer.listen(process.env.PORT!, () => {
    console.log(`server running on http://localhost:${process.env.PORT!}`);
  });
});
