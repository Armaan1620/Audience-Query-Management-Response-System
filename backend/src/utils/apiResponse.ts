export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  details?: unknown;
}

export const success = <T>(data: T, message?: string): ApiSuccess<T> => ({
  success: true,
  data,
  message,
});

export const failure = (message: string, details?: unknown): ApiError => ({
  success: false,
  message,
  details,
});
