import axios from "axios";
import { config } from "@/lib/config";

export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10_000,
});
