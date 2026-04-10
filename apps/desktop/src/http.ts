import http from "node:http";
import https from "node:https";
import type { IncomingHttpHeaders } from "node:http";

interface RequestOptions {
  body?: string;
  headers?: Record<string, string>;
  method?: string;
  timeoutMs?: number;
}

interface ResponsePayload {
  body: string;
  headers: IncomingHttpHeaders;
  statusCode: number;
}

export async function requestRaw(targetUrl: string, options: RequestOptions = {}): Promise<ResponsePayload> {
  const url = new URL(targetUrl);
  const transport = url.protocol === "https:" ? https : http;
  const method = options.method ?? (options.body ? "POST" : "GET");
  const timeoutMs = options.timeoutMs ?? 4000;

  return await new Promise((resolve, reject) => {
    const request = transport.request(
      url,
      {
        method,
        headers: options.headers,
      },
      (response) => {
        const chunks: Buffer[] = [];

        response.on("data", (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        response.on("end", () => {
          resolve({
            body: Buffer.concat(chunks).toString("utf8"),
            headers: response.headers,
            statusCode: response.statusCode ?? 0,
          });
        });
      },
    );

    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error("Request timed out after " + String(timeoutMs) + "ms."));
    });

    request.on("error", (error) => {
      reject(error);
    });

    if (options.body) {
      request.write(options.body);
    }

    request.end();
  });
}

export async function requestOk(targetUrl: string, options?: RequestOptions) {
  const response = await requestRaw(targetUrl, options);
  return response.statusCode >= 200 && response.statusCode < 300;
}

export async function requestJson<T>(targetUrl: string, options?: RequestOptions): Promise<{ data: T; statusCode: number }> {
  const response = await requestRaw(targetUrl, options);

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error("Request failed with status " + String(response.statusCode) + ".");
  }

  return {
    data: JSON.parse(response.body || "null") as T,
    statusCode: response.statusCode,
  };
}
