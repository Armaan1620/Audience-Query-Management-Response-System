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

export const success = <T>(data: T, message?: string): ApiSuccess<T> => {
  const response: ApiSuccess<T> = {
    success: true,
    data,
  };

  if (message !== undefined) {
    response.message = message;
  }

  return response;
};

export const failure = (message: string, details?: unknown): ApiError => {
  const error: ApiError = {
    success: false,
    message,
  };

  if (details !== undefined) {
    error.details = details;
  }

  return error;
};
