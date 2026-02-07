"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

import { createJobsSocket } from "@/lib/ws/jobsSocket";

export type JobsWebSocketStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting";

export function useJobsWebSocket(keyword: string) {
  const queryClient = useQueryClient();

  const socketRef = React.useRef<WebSocket | null>(null);
  const reconnectTimerRef = React.useRef<number | null>(null);
  const retriesRef = React.useRef(0);
  const disposedRef = React.useRef(false);
  const currentKeywordRef = React.useRef("");

  const [status, setStatus] = React.useState<JobsWebSocketStatus>(
    "disconnected",
  );
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    disposedRef.current = false;

    const normalizedKeyword = keyword.trim();

    if (currentKeywordRef.current === normalizedKeyword) {
      return;
    }

    currentKeywordRef.current = normalizedKeyword;

    function clearReconnectTimer() {
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    }

    function disconnect() {
      clearReconnectTimer();

      const ws = socketRef.current;
      socketRef.current = null;

      if (ws) {
        ws.onopen = null;
        ws.onclose = null;
        ws.onmessage = null;
        ws.onerror = null;

        try {
          ws.close();
        } catch (error) {
          console.error("[useJobsWebSocket] close() failed", error);
        }
      }

      setStatus("disconnected");
    }

    disconnect();

    if (!normalizedKeyword) {
      return () => {
        disposedRef.current = true;
        disconnect();
      };
    }

    const maxRetries = 5;
    const retryDelayMs = 3000;

    const onUpdate = () => {
      if (disposedRef.current) return;

      setIsRefreshing(true);

      queryClient.invalidateQueries({
        queryKey: ["jobs"],
      });
    };

    function connect(nextStatus: JobsWebSocketStatus) {
      if (disposedRef.current) return;

      setStatus(nextStatus);

      try {
        const ws = createJobsSocket(normalizedKeyword, onUpdate);
        socketRef.current = ws;

        ws.onopen = () => {
          retriesRef.current = 0;
          setStatus("connected");
        };

        ws.onclose = () => {
          if (disposedRef.current) return;

          if (retriesRef.current >= maxRetries) {
            setStatus("disconnected");
            return;
          }

          retriesRef.current += 1;
          setStatus("reconnecting");

          clearReconnectTimer();
          reconnectTimerRef.current = window.setTimeout(() => {
            connect("reconnecting");
          }, retryDelayMs);
        };

        ws.onerror = (error) => {
          console.error("[useJobsWebSocket] WebSocket error", error);
        };
      } catch (error) {
        console.error("[useJobsWebSocket] Failed to connect", error);
        setStatus("disconnected");
      }
    }

    connect("connecting");

    return () => {
      disposedRef.current = true;
      disconnect();
    };
  }, [keyword, queryClient]);

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

  return { status, isRefreshing };
}
