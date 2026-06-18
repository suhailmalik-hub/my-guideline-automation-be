import { randomUUID } from "crypto";
import { Response } from "express";

export enum SseBroadcastEvent {
  AUTOMATION_STARTED = "automation:started",
  AUTOMATION_COMPLETED = "automation:completed",
  AUTOMATION_RUN_ERROR = "automation:run_error",

  GUIDELINE_NOTIFICATION = "automate:guideline_notification",

  AUTOMATION_PLAY_STARTED = "automation:play_started",
  AUTOMATION_PLAY_COMPLETED = "automation:play_completed",
  AUTOMATION_PLAY_ERROR = "automation:play_error",

  MANUAL_AUTOMATION_RUN_STARTED = "automation:manual_run_started",
  MANUAL_AUTOMATION_RUN_COMPLETED = "automation:manual_run_completed",
  MANUAL_AUTOMATION_RUN_ERROR = "automation:manual_run_error",
}

export interface SseEvent {
  event: SseBroadcastEvent | string;
  data: Record<string, unknown>;
}

class SseManager {
  private clients: Map<string, Response> = new Map();
  constructor() {
    setInterval(() => {
      for (const [clientId, res] of this.clients) {
        try {
          res.write(": ping\n\n");
        } catch {
          this.removeClient(clientId);
        }
      }
    }, 15000);
  }

  addClient(res: Response): string {
    const clientId = randomUUID();

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering
    res.flushHeaders();

    this.clients.set(clientId, res);
    console.log(
      `[SSE] Client connected: ${clientId} (total: ${this.clients.size})`,
    );

    // Send initial connected event
    this.sendToClient(res, { event: "connected", data: { clientId } });

    return clientId;
  }

  removeClient(clientId: string): void {
    this.clients.delete(clientId);
    console.log(
      `[SSE] Client disconnected: ${clientId} (total: ${this.clients.size})`,
    );
  }

  broadcast(event: SseBroadcastEvent, data: Record<string, unknown>): void {
    console.log(`[SSE] Broadcasting "${event}" to ${this.clients.size} client(s)`);
    if (this.clients.size === 0) return;

    const payload: SseEvent = { event, data };
    for (const [, res] of this.clients) {
      this.sendToClient(res, payload);
    }
  }

  isClientConnected(clientId: string): boolean {
    return this.clients.has(clientId);
  }

  private sendToClient(res: Response, payload: SseEvent): void {
    try {
      res.write(`event: ${payload.event}\n`);
      res.write(`data: ${JSON.stringify(payload.data)}\n\n`);
    } catch {
      // Client may have disconnected mid-write; harmless
    }
  }
}

// Singleton — shared across the entire process
export const sseManager = new SseManager();
