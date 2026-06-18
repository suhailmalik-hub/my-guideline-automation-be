import IORedis from "ioredis";

const base = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD ?? undefined,
  keepAlive: 30000, // send TCP keepalive every 30s — prevents Azure from dropping idle connections
};

// Workers must block indefinitely waiting for jobs — null required by BullMQ
export const redisWorkerConnectionOptions = {
  ...base,
  maxRetriesPerRequest: null,
};

// Queues (producers) should fail fast so API calls never hang
export const redisQueueConnectionOptions = {
  ...base,
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false, // reject commands immediately if connection is down
};

// Keep legacy export so existing imports don't break
export const redisConnectionOptions = redisWorkerConnectionOptions;

export const redisConnection = new IORedis(base);

redisConnection.on("connect", () => {
  console.log("[Redis] Connected");
});

redisConnection.on("error", (err) => {
  console.error("[Redis] Connection error:", err.message);
});
