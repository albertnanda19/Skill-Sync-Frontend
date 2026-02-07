type WsSubscriber = (payload: unknown) => void;

type WsServerMessage = {
  type?: unknown;
  channel?: unknown;
  event?: unknown;
};

type WsSubscribeMessage = {
  action: "subscribe";
  channel: string;
};

type WsUnsubscribeMessage = {
  action: "unsubscribe";
  channel: string;
};

type WsPingMessage = {
  type: "ping";
};

type WsPongMessage = {
  type: "pong";
};

function isBrowser() {
  return typeof window !== "undefined";
}

function safeJsonParse(input: unknown): unknown {
  if (typeof input !== "string") return null;
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

class WsManager {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private lastPongAt = 0;

  private urlOverride: string | null = null;

  private subscribers: Map<string, Set<WsSubscriber>> = new Map();

  private readonly heartbeatIntervalMs = 30_000;
  private readonly pongTimeoutMs = 65_000;

  private getWsUrlRaw(): string {
    const url = process.env.NEXT_PUBLIC_WS_URL;
    return typeof url === "string" ? url.trim() : "";
  }

  private getWsUrl(): string {
    if (this.urlOverride) return this.urlOverride;
    const raw = this.getWsUrlRaw();
    if (!raw) return "";
    if (!isBrowser()) return raw;

    if (raw.startsWith("ws://") || raw.startsWith("wss://")) {
      return raw;
    }

    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      const wsProtocol = raw.startsWith("https://") ? "wss://" : "ws://";
      return wsProtocol + raw.replace(/^https?:\/\//, "");
    }

    if (raw.startsWith("/")) {
      const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
      const base = `${wsProtocol}://${window.location.host}`;
      return new URL(raw, base).toString();
    }

    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    return `${wsProtocol}://${raw}`;
  }

  private setConnected(next: boolean) {
    this.isConnected = next;
  }

  private clearReconnectTimer() {
    if (!isBrowser()) return;
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private clearHeartbeatTimer() {
    if (!isBrowser()) return;
    if (this.heartbeatTimer !== null) {
      window.clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private hasSubscribers() {
    return this.subscribers.size > 0;
  }

  private scheduleReconnect() {
    if (!isBrowser()) return;
    if (!this.hasSubscribers()) return;
    if (!this.isEnabled()) return;
    this.clearReconnectTimer();

    this.reconnectAttempts += 1;
    const delay = Math.min(1000 * this.reconnectAttempts, 10_000);
    console.log(`[wsManager] WS reconnecting (attempt ${this.reconnectAttempts}) in ${delay}ms`);

    this.reconnectTimer = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat() {
    if (!isBrowser()) return;
    this.clearHeartbeatTimer();

    this.lastPongAt = Date.now();

    this.heartbeatTimer = window.setInterval(() => {
      const ws = this.socket;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        this.reconnect();
        return;
      }

      const now = Date.now();
      if (this.lastPongAt && now - this.lastPongAt > this.pongTimeoutMs) {
        console.log("[wsManager] Heartbeat timeout, reconnecting");
        this.reconnect();
        return;
      }

      this.send({ type: "ping" } satisfies WsPingMessage);
    }, this.heartbeatIntervalMs);
  }

  private stopAllTimers() {
    this.clearReconnectTimer();
    this.clearHeartbeatTimer();
  }

  private resubscribeAll() {
    const ws = this.socket;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    if (this.urlOverride) {
      return;
    }

    for (const channel of this.subscribers.keys()) {
      this.send({ action: "subscribe", channel } satisfies WsSubscribeMessage);
      console.log(`[wsManager] Subscribed to channel ${channel}`);
    }
  }

  private handleMessage(data: unknown) {
    const parsed = safeJsonParse(data);
    if (!parsed || typeof parsed !== "object") return;

    const msg = parsed as WsServerMessage;

    if ((msg as WsPongMessage).type === "pong") {
      this.lastPongAt = Date.now();
      return;
    }

    const channel = typeof msg.channel === "string" ? msg.channel : "";
    if (!channel) {
      for (const callbacks of this.subscribers.values()) {
        for (const cb of callbacks) {
          try {
            cb(parsed);
          } catch (err) {
            console.error("[wsManager] subscriber callback error", err);
          }
        }
      }
      return;
    }

    const callbacks = this.subscribers.get(channel);
    if (!callbacks || callbacks.size === 0) return;

    console.log(`[wsManager] Received event for channel ${channel}`);

    for (const cb of callbacks) {
      try {
        cb(parsed);
      } catch (err) {
        console.error("[wsManager] subscriber callback error", err);
      }
    }
  }

  private attachSocketHandlers(ws: WebSocket) {
    ws.onopen = () => {
      this.setConnected(true);
      this.reconnectAttempts = 0;
      console.log("[wsManager] WS connected");

      this.startHeartbeat();
      this.resubscribeAll();
    };

    ws.onclose = () => {
      this.setConnected(false);
      console.log("[wsManager] WS disconnected");
      this.clearHeartbeatTimer();
      this.scheduleReconnect();
    };

    ws.onerror = (error) => {
      console.error("[wsManager] WS error", error);

      const readyState = ws.readyState;
      if (
        readyState === WebSocket.CLOSING ||
        readyState === WebSocket.CLOSED
      ) {
        return;
      }

      if (!this.isConnected) {
        this.scheduleReconnect();
      }
    };

    ws.onmessage = (event) => {
      this.handleMessage(event.data);
    };
  }

  connect() {
    if (!isBrowser()) return;

    const url = this.getWsUrl();
    if (!url) return;
    if (!this.hasSubscribers()) return;

    const existing = this.socket;
    const existingIsActive =
      existing &&
      (existing.readyState === WebSocket.OPEN ||
        existing.readyState === WebSocket.CONNECTING);

    if (existingIsActive) return;

    this.stopAllTimers();

    console.log(`[wsManager] WS connecting to ${url}`);

    try {
      const ws = new WebSocket(url);
      this.socket = ws;
      this.attachSocketHandlers(ws);
    } catch (err) {
      console.error("[wsManager] Failed to connect", err);
      this.scheduleReconnect();
    }
  }

  connectTo(url: string) {
    const normalized = url.trim();
    if (!normalized) return;

    this.urlOverride = normalized;
    this.connect();
  }

  disconnect() {
    this.stopAllTimers();

    const ws = this.socket;
    this.socket = null;
    this.setConnected(false);

    if (ws) {
      ws.onopen = null;
      ws.onclose = null;
      ws.onmessage = null;
      ws.onerror = null;

      try {
        ws.close();
      } catch (err) {
        console.error("[wsManager] close() failed", err);
      }
    }
  }

  reconnect() {
    this.disconnect();
    this.connect();
  }

  subscribe(channel: string, callback: WsSubscriber) {
    const normalized = channel.trim();
    if (!normalized) return;

    let set = this.subscribers.get(normalized);
    if (!set) {
      set = new Set();
      this.subscribers.set(normalized, set);
    }

    set.add(callback);

    this.connect();

    const ws = this.socket;
    if (ws && ws.readyState === WebSocket.OPEN && !this.urlOverride) {
      this.send({
        action: "subscribe",
        channel: normalized,
      } satisfies WsSubscribeMessage);
      console.log(`[wsManager] Subscribed to channel ${normalized}`);
    }
  }

  unsubscribe(channel: string, callback: WsSubscriber) {
    const normalized = channel.trim();
    if (!normalized) return;

    const set = this.subscribers.get(normalized);
    if (!set) return;

    set.delete(callback);

    if (set.size === 0) {
      this.subscribers.delete(normalized);

      const ws = this.socket;
      if (ws && ws.readyState === WebSocket.OPEN && !this.urlOverride) {
        this.send({
          action: "unsubscribe",
          channel: normalized,
        } satisfies WsUnsubscribeMessage);
      }
    }

    if (!this.hasSubscribers()) {
      this.urlOverride = null;
      this.disconnect();
    }
  }

  send(message: unknown) {
    const ws = this.socket;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    try {
      ws.send(JSON.stringify(message));
    } catch (err) {
      console.error("[wsManager] send() failed", err);
    }
  }

  getConnectionState() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  isEnabled() {
    return Boolean(this.getWsUrl());
  }

  getReadyState() {
    return this.socket?.readyState ?? null;
  }
}

export const wsManager = new WsManager();
