"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

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

  return {
    type: "jobs_updated",
    keyword,
    new_jobs: Math.max(0, Math.trunc(newJobs)),
  };
}

export function useJobsWebSocket(keyword: string, connectKey = 0) {
  const queryClient = useQueryClient();

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

    const onUpdate = () => {
      setIsRefreshing(true);
      queryClient.invalidateQueries({
        queryKey: ["jobs"],
      });
    };

    const onMessage = (payload: unknown) => {
      const evt = normalizeJobsUpdatedEvent(payload);
      if (evt) setLastEvent(evt);
      onUpdate();
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
  }, [keyword, connectKey, queryClient]);

  React.useEffect(() => {
    if (!isRefreshing) return;

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      const query = event?.query;
      if (!query) return;

      const queryKey = query.queryKey;
      if (!Array.isArray(queryKey) || queryKey[0] !== "jobs") return;

      if (query.state.status === "success") {
        setIsRefreshing(false);
      }
    });

    return unsubscribe;
  }, [isRefreshing, queryClient]);

  return { status, isRefreshing, hasError, lastEvent };
}
