import axios from "axios";
import { config } from "@/lib/config";

export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

/**
 * Use for endpoints that aggregate cross-region data (DB hosted in a different
 * AWS region from the user). The default 30s axios timeout is too tight when
 * a single page fires 4-6 such GETs in parallel and per-query latencies stack.
 */
export const apiClientLong = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60_000,
});
