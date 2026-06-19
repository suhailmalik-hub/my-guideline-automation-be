import { Queue, Worker } from "bullmq";
import {
  redisQueueConnectionOptions,
  redisWorkerConnectionOptions,
} from "../lib/connections";
import { playGuidelineAutomate } from "../services";
import { PlayGuidelineAutomateRequest } from "../types";

const QUEUE_NAME = "guideline-play-automation";
export const PLAY_QUEUE_CONCURRENCY = 3;

// Queue - used by API route to enqueue play jobs
export const guidelinePlayQueue = new Queue(QUEUE_NAME, {
  connection: redisQueueConnectionOptions,
  defaultJobOptions: {
    removeOnComplete: 100, // keep last 100 completed jobs for visibility
    removeOnFail: 200, // keep last 200 failed jobs
  },
});

export const guidelinePlayQueueWorker = (): Worker => {
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      try {
        await playGuidelineAutomate(
          job.data as unknown as PlayGuidelineAutomateRequest,
        );
      } catch (error) {
        // error is handled in service and broadcast via SSE — job completes normally
      }
    },
    {
      connection: redisWorkerConnectionOptions,
      concurrency: PLAY_QUEUE_CONCURRENCY,
    },
  );

  worker.on("active", (job) => {
    console.log(
      `[GuidelinePlayWorker] Job ${job.id} started — guidelineId=${job.data.guidelineId}`,
    );
  });
  worker.on("completed", (job) => {
    console.log(
      `[GuidelinePlayWorker] Job ${job.id} completed — guidelineId=${job.data.guidelineId}`,
    );
  });
  worker.on("failed", (job, err) => {
    console.error(
      `[GuidelinePlayWorker] Job ${job?.id} failed — guidelineId=${job?.data.guidelineId}: ${err.message}`,
    );
  });
  worker.on("error", (err) => {
    console.error(`[GuidelinePlayWorker] Worker error: ${err.message}`);
  });

  console.log(
    `[GuidelinePlayWorker] Worker started (concurrency: ${PLAY_QUEUE_CONCURRENCY})`,
  );

  return worker;
};
