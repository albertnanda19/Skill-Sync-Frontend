"use client";

import * as React from "react";

import { wsManager } from "@/lib/websocket/wsManager";

export type JobsWebSocketStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting";

export type JobsUpdatedEvent = {
  type: "jobs_updated";
  keyword: string;
  new_jobs: number;
  has_new_data?: boolean;
  max_job_created_at?: string;
  source?: string;
};

function normalizeJobsUpdatedEvent(payload: unknown): JobsUpdatedEvent | null {
  if (!payload || typeof payload !== "object") return null;

  const p = payload as Record<string, unknown>;
  const type = typeof p.type === "string" ? p.type : "";
  if (type !== "jobs_updated") return null;

  const keyword = typeof p.keyword === "string" ? p.keyword : "";
  const newJobsRaw = p.new_jobs;
  const newJobs =
    typeof newJobsRaw === "number"
      ? newJobsRaw
      : Number.isFinite(Number(newJobsRaw))
        ? Number(newJobsRaw)
        : 0;

  const hasNewDataRaw = p.has_new_data;
  const has_new_data = typeof hasNewDataRaw === "boolean" ? hasNewDataRaw : undefined;

  const maxCreatedAtRaw = p.max_job_created_at;
  const max_job_created_at =
    typeof maxCreatedAtRaw === "string" && maxCreatedAtRaw.trim()
      ? maxCreatedAtRaw.trim()
      : undefined;

  const sourceRaw = p.source;
  const source = typeof sourceRaw === "string" && sourceRaw.trim() ? sourceRaw.trim() : undefined;

  return {
    type: "jobs_updated",
    keyword,
    new_jobs: Math.max(0, Math.trunc(newJobs)),
    ...(typeof has_new_data === "boolean" ? { has_new_data } : {}),
    ...(max_job_created_at ? { max_job_created_at } : {}),
    ...(source ? { source } : {}),
  };
}

export function useJobsWebSocket(keyword: string, connectKey = 0) {
  const [status, setStatus] = React.useState<JobsWebSocketStatus>(
    "disconnected",
  );
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [lastEvent, setLastEvent] = React.useState<JobsUpdatedEvent | null>(
    null,
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const timer = window.setInterval(() => {
      if (!wsManager.isEnabled()) {
        setStatus("disconnected");
        return;
      }

      const readyState = wsManager.getReadyState();
      const { isConnected, reconnectAttempts } = wsManager.getConnectionState();

      if (isConnected || readyState === WebSocket.OPEN) {
        setStatus("connected");
        return;
      }

      if (readyState === WebSocket.CONNECTING) {
        setStatus(reconnectAttempts > 0 ? "reconnecting" : "connecting");
        return;
      }

      if (reconnectAttempts > 0) {
        setStatus("reconnecting");
        return;
      }

      setStatus("disconnected");
    }, 500);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const normalizedKeyword = keyword.trim();
    const channel = normalizedKeyword ? `jobs:updated:${normalizedKeyword}` : "";

    if (!channel) {
      setHasError(false);
      setStatus("disconnected");
      return;
    }

    if (!wsManager.isEnabled()) {
      setHasError(false);
      setStatus("disconnected");
      return;
    }

    setStatus("connecting");
    setHasError(false);

    const baseUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (typeof baseUrl !== "string" || !baseUrl.trim()) {
      setHasError(false);
      setStatus("disconnected");
      return;
    }

    let wsUrlWithKeyword = "";
    try {
      const u = new URL(baseUrl, window.location.origin);
      u.searchParams.set("keyword", normalizedKeyword);
      wsUrlWithKeyword = u.toString();
    } catch (error) {
      console.error("[useJobsWebSocket] Invalid NEXT_PUBLIC_WS_URL", error);
      setHasError(true);
      setStatus("disconnected");
      return;
    }

    const onMessage = (payload: unknown) => {
      const evt = normalizeJobsUpdatedEvent(payload);
      if (!evt) return;
      setLastEvent(evt);
      setIsRefreshing(true);
    };

    try {
      wsManager.connectTo(wsUrlWithKeyword);
      wsManager.subscribe(channel, onMessage);
    } catch (error) {
      console.error("[useJobsWebSocket] Failed to subscribe", error);
      setHasError(true);
      setStatus("disconnected");
    }

    return () => {
      try {
        wsManager.unsubscribe(channel, onMessage);
      } catch (error) {
        console.error("[useJobsWebSocket] Failed to unsubscribe", error);
      }
    };
  }, [keyword, connectKey]);

  React.useEffect(() => {
    if (!isRefreshing) return;

    const t = window.setTimeout(() => setIsRefreshing(false), 800);
    return () => window.clearTimeout(t);
  }, [isRefreshing]);

  return { status, isRefreshing, hasError, lastEvent };
}
