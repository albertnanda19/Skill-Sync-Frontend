"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

import { wsManager } from "@/lib/websocket/wsManager";

export type JobsWebSocketStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting";

export function useJobsWebSocket(keyword: string, connectKey = 0) {
  const queryClient = useQueryClient();

  const [status, setStatus] = React.useState<JobsWebSocketStatus>(
    "disconnected",
  );
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

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

    const onMessage = (_payload: unknown) => {
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

  return { status, isRefreshing, hasError };
}
