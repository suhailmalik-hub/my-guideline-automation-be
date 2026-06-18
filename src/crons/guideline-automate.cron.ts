import cron from "node-cron";
import { Op } from "sequelize";
// import { CONCURRENCY, guidelineCronQueue } from "../lib/queue";
import { GuidelineConfigModel } from "../models/guideline-config.model";
import { CONCURRENCY, guidelineCronQueue } from "../queues";
import { GuidelineAutomateStatus } from "../types";

// Enqueue 2x concurrency slots ahead — enough to keep the worker busy without flooding Redis
const BATCH_SIZE = CONCURRENCY * 2;

/**
 * Each tick:
 * 1. Find the readable_id of the last cron-run record (rotation pointer).
 * 2. Pick the next BATCH_SIZE PUBLISHED records after that pointer.
 * 3. If fewer than BATCH_SIZE found, wrap around from the beginning to fill.
 * 4. Enqueue each with jobId = guidelineId (BullMQ deduplicates).
 */
const enqueueNextBatch = async (): Promise<void> => {
  console.log("[GuidelineAutomateCron] Tick — enqueuing next batch...");

  try {
    const publishedWhere = {
      status: GuidelineAutomateStatus.PUBLISHED,
      is_running: { [Op.ne]: true },
    };

    // Find the rotation pointer (readable_id of most recently cron-run record)
    const lastRun = await GuidelineConfigModel.findOne({
      where: { cron_last_run: { [Op.ne]: null } },
      order: [["cron_last_run", "DESC"]],
      attributes: ["readable_id"],
    });

    const lastReadableId = lastRun?.readable_id ?? 0;

    // Pick next records after the pointer
    const afterPointer = await GuidelineConfigModel.findAll({
      where: { ...publishedWhere, readable_id: { [Op.gt]: lastReadableId } },
      order: [["readable_id", "ASC"]],
      limit: BATCH_SIZE,
      attributes: ["id", "readable_id"],
    });

    let batch = afterPointer;

    // Wrap around if we need more records
    if (batch.length < BATCH_SIZE) {
      const alreadyPickedIds = batch.map((r) => r.id);
      const remaining = BATCH_SIZE - batch.length;

      const fromStart = await GuidelineConfigModel.findAll({
        where: {
          ...publishedWhere,
          ...(alreadyPickedIds.length
            ? { id: { [Op.notIn]: alreadyPickedIds } }
            : {}),
          readable_id: { [Op.lte]: lastReadableId },
        },
        order: [["readable_id", "ASC"]],
        limit: remaining,
        attributes: ["id", "readable_id"],
      });

      batch = [...batch, ...fromStart];
    }

    if (batch.length === 0) {
      console.log("[GuidelineAutomateCron] No PUBLISHED records to enqueue.");
      return;
    }

    for (const record of batch) {
      await guidelineCronQueue.add("run", { guidelineId: record.id as string });
    }

    console.log(
      `[GuidelineAutomateCron] Enqueued ${batch.length} record(s) (pointer was readable_id=${lastReadableId}).`,
    );
  } catch (error) {
    console.error(
      "[GuidelineAutomateCron] Error during enqueue:",
      error instanceof Error ? error.message : error,
    );
  }
};

// Fires every 5 minutes — enqueues a small batch, worker handles concurrency
export const startGuidelineAutomateCron = (): void => {
  cron.schedule("*/3 * * * *", enqueueNextBatch, {
    name: "guideline-automate-cron",
  });

  console.log(
    "[GuidelineAutomateCron] Cron job scheduled (every 3 minutes, batch size: " +
      BATCH_SIZE +
      ").",
  );
};
