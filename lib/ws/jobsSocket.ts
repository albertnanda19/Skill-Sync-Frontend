export type JobsSocketEvent = {
  type?: unknown;
  keyword?: unknown;
  source?: unknown;
  timestamp?: unknown;
};

function buildJobsSocketUrl(keyword: string) {
  const normalizedKeyword = keyword.trim();
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const host = window.location.host;
  const url = new URL(`${protocol}://${host}/ws/jobs`);
  url.searchParams.set("keyword", normalizedKeyword);
  return url.toString();
}

export function createJobsSocket(keyword: string, onUpdate: () => void): WebSocket {
  const normalizedKeyword = keyword.trim();
  const ws = new WebSocket(buildJobsSocketUrl(normalizedKeyword));

  ws.onmessage = (event) => {
    try {
      const parsed: JobsSocketEvent = JSON.parse(
        typeof event.data === "string" ? event.data : "{}",
      );

      const type = typeof parsed.type === "string" ? parsed.type : "";
      const eventKeyword =
        typeof parsed.keyword === "string" ? parsed.keyword : "";

      if (type === "jobs_updated" && eventKeyword === normalizedKeyword) {
        onUpdate();
      }
    } catch (error) {
      console.error("[jobsSocket] Failed to parse message", error);
    }
  };

  ws.onerror = (error) => {
    console.error("[jobsSocket] WebSocket error", error);
  };

  return ws;
}
