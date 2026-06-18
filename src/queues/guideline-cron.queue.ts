import { Job, Queue, Worker } from "bullmq";
import { redisQueueConnectionOptions, redisWorkerConnectionOptions } from "../lib/connections";
import { GuidelineConfigModel } from "../models";
import { cronRunAutomation } from "../services";
const QUEUE_NAME = "guideline-cron-automation";
export const CONCURRENCY = 3;

export interface GuidelineJobData {
  guidelineId: string;
}

// Queue — used by cron to enqueue jobs
export const guidelineCronQueue = new Queue<GuidelineJobData>(QUEUE_NAME, {
  connection: redisQueueConnectionOptions,
  defaultJobOptions: {
    removeOnComplete: 100, // keep last 100 completed jobs for visibility
    removeOnFail: 200, // keep last 200 failed jobs
  },
});

// Worker — processes jobs with max CONCURRENCY running at once
export const guidelineCronQueueWorker = (): Worker<GuidelineJobData> => {
  const worker = new Worker<GuidelineJobData>(
    QUEUE_NAME,
    async (job: Job<GuidelineJobData>) => {
      const { guidelineId } = job.data;
      try {
        await cronRunAutomation(guidelineId);
      } catch (error) {
        // do nothing here — error is handled in service and logged, we just want to ensure the job completes so the pointer can move forward
      } finally {
        // Update cron_last_run after processing (even if it fails) to ensure rotation continues smoothly
        await GuidelineConfigModel.update(
          { cron_last_run: new Date() },
          { where: { id: guidelineId } },
        );
      }
    },
    {
      connection: redisWorkerConnectionOptions,
      concurrency: CONCURRENCY,
    },
  );

  worker.on("failed", (job, err) => {
    console.error(
      `[GuidelineCronWorker] Job ${job?.id} failed — guidelineId=${job?.data.guidelineId}: ${err.message}`,
    );
  });

  console.log(
    `[GuidelineCronWorker] Worker started (concurrency: ${CONCURRENCY})`,
  );

  return worker;
};
