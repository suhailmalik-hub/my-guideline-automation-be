import cors from "cors";
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import { connectDB } from "./lib/connections/db-connection";
import { errorHandler } from "./middleware/error-handler";
import { GuidelineConfigModel } from "./models";
import {
  guidelineCronQueueWorker,
  guidelinePlayQueueWorker,
  guidelineRunQueueWorker,
} from "./queues";
import routes from "./routes";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(
  cors({
    origin: [
      "https://guideline-automation.intellivisa.ai",
      "http://localhost:3002",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api", routes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const { message, statusCode, stack } = errorHandler(err);
  console.error(stack);
  res.status(statusCode).json({ success: false, message });
});

connectDB().then(async () => {
  // Reset any records stuck as is_running=true from a previous crashed session
  await GuidelineConfigModel.update(
    { is_running: false },
    { where: { is_running: true } },
  );

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Start CRON
  // startGuidelineAutomateCron();

  // Start queue workers
  guidelineCronQueueWorker();
  guidelinePlayQueueWorker();
  guidelineRunQueueWorker();
});
