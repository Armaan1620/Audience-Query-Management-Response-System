// simulator/httpClient.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Resolve a full URL for a channel.
 * - If the per-channel env var is set, use it as-is (absolute URL).
 * - Otherwise, combine INGESTION_BASE_URL with a default path.
 */
function resolveUrl(pathEnvVarName, defaultPath) {
  const override = process.env[pathEnvVarName];
  if (override) {
    return override;
  }

  const base = process.env.INGESTION_BASE_URL || 'http://localhost:4000';
  return `${base}${defaultPath}`;
}

const httpClient = axios.create({
  timeout: Number(process.env.HTTP_CLIENT_TIMEOUT_MS) || 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Centralized logging for HTTP errors
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    console.error('[HTTP ERROR]', {
      message: error.message,
      status,
      data: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
    });

    return Promise.reject(error);
  }
);

export { httpClient, resolveUrl };
