import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const httpClient = axios.create({
  baseURL: process.env.INGESTION_BASE_URL || 'http://localhost:4000/api',
  timeout: Number(process.env.HTTP_CLIENT_TIMEOUT_MS) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const url = error.config?.url;

    console.error('[HTTP ERROR]', {
      url,
      message: error.message,
      status,
      data: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
    });

    return Promise.reject(error);
  }
);

export default httpClient;

