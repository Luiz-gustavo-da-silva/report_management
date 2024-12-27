import express, { Express, Request, Response } from "express";
import rootRouter from "./router";
import { PrismaClient } from "@prisma/client";
import { PORT } from "./secrets";
import { errorMiddleware } from "./middlewares/errors";

const app: Express = express();

app.use(express.json());
app.use("/api", rootRouter);

export const prismaCilent = new PrismaClient({
  log: ["query"],
});

app.use(errorMiddleware)

app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});
