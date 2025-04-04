import { API_CONFIG, ERROR_MESSAGES, HTTP_STATUS } from '../config/api.config';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchWithConfig<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    const mergedOptions: RequestInit = {
      headers: API_CONFIG.HEADERS,
      ...options,
    };

    const response = await fetch(url, mergedOptions);

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || getErrorMessage(response.status);
      throw new Error(errorMessage);
    }

    // For no content responses
    if (response.status === 204) {
      return {} as T;
    }

    // Parse JSON response
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error(ERROR_MESSAGES.DEFAULT);
  }
}

/**
 * Get appropriate error message from status code
 */
function getErrorMessage(status: number): string {
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return ERROR_MESSAGES.DEFAULT;
    case HTTP_STATUS.UNAUTHORIZED:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case HTTP_STATUS.FORBIDDEN:
      return ERROR_MESSAGES.FORBIDDEN;
    case HTTP_STATUS.NOT_FOUND:
      return ERROR_MESSAGES.NOT_FOUND;
    case HTTP_STATUS.SERVER_ERROR:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      return ERROR_MESSAGES.DEFAULT;
  }
}

/**
 * API service for making HTTP requests
 */
export const ApiService = {
  /**
   * GET request
   */
  get: async <T>(url: string): Promise<T> => {
    return fetchWithConfig<T>(url, {
      method: 'GET',
    });
  },

  /**
   * POST request
   */
  post: async <T>(url: string, data: any): Promise<T> => {
    return fetchWithConfig<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT request
   */
  put: async <T>(url: string, data: any): Promise<T> => {
    return fetchWithConfig<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE request
   */
  delete: async <T>(url: string): Promise<T> => {
    return fetchWithConfig<T>(url, {
      method: 'DELETE',
    });
  },
};
