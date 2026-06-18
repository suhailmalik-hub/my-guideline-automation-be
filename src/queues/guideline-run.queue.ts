import { Queue, Worker } from "bullmq";
import { redisQueueConnectionOptions, redisWorkerConnectionOptions } from "../lib/connections";
import { runAutomation } from "../services";
import { RunGuidelineAutomateRequest } from "../types";

const QUEUE_NAME = "guideline-run-automation";
export const RUN_QUEUE_CONCURRENCY = 3;

// Queue - used by API route to enqueue run jobs
export const guidelineRunQueue = new Queue(QUEUE_NAME, {
  connection: redisQueueConnectionOptions,
  defaultJobOptions: {
    removeOnComplete: 100, // keep last 100 completed jobs for visibility
    removeOnFail: 200, // keep last 200 failed jobs
  },
});

export const guidelineRunQueueWorker = (): Worker => {
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      try {
        await runAutomation(
          job.data as unknown as RunGuidelineAutomateRequest,
        );
      } catch (error) {
        // do nothing here — error is handled in service and logged, we just want to ensure the job completes so the pointer can move forward
      }
    },
    {
      connection: redisWorkerConnectionOptions,
      concurrency: RUN_QUEUE_CONCURRENCY,
    },
  );

  worker.on("active", (job) => {
    console.log(
      `[GuidelineRunWorker] Job ${job.id} started — guidelineId=${job.data.guidelineId}`,
    );
  });
  worker.on("completed", (job) => {
    console.log(
      `[GuidelineRunWorker] Job ${job.id} completed — guidelineId=${job.data.guidelineId}`,
    );
  });
  worker.on("failed", (job, err) => {
    console.error(
      `[GuidelineRunWorker] Job ${job?.id} failed — guidelineId=${job?.data.guidelineId}: ${err.message}`,
    );
  });
  worker.on("error", (err) => {
    console.error(`[GuidelineRunWorker] Worker error: ${err.message}`);
  });

  console.log(`[GuidelineRunWorker] Worker started (concurrency: ${RUN_QUEUE_CONCURRENCY})`);

  return worker;
};
