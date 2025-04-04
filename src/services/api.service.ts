import { API_CONFIG, ERROR_MESSAGES, HTTP_STATUS } from '../config/api.config';

async function fetchWithConfig<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    // Get the authentication token from localStorage if available
    const authToken = localStorage.getItem('auth_token');
    
    // Prepare headers with authentication if available
    const headers = {
      ...API_CONFIG.HEADERS,
      ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
    };

    const mergedOptions: RequestInit = {
      headers,
      ...options,
    };

    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    if (options.body) {
      console.log('Request payload:', JSON.parse(options.body as string));
    }
    
    console.log('Request headers:', headers);
    
    // Add request timeout
    const timeoutPromise = new Promise<Response>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 30000);
    });
    
    const fetchPromise = fetch(url, mergedOptions);
    const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

    // Log response status
    console.log(`API Response status: ${response.status} ${response.statusText}`);

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      
      // Extract detailed error information from various response formats
      const errorMessage = 
        errorData.detail || 
        errorData.message || 
        errorData.error || 
        (Array.isArray(errorData.errors) && errorData.errors.length > 0 ? 
          errorData.errors.map((e: any) => e.message || e).join('; ') : 
          getErrorMessage(response.status));
      
      throw new Error(errorMessage);
    }

    // For no content responses
    if (response.status === 204) {
      return {} as T;
    }

    // Parse JSON response
    const data = await response.json();
    console.log('API Response data:', data);
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error(ERROR_MESSAGES.DEFAULT);
  }
}

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
    // Ensure URL is properly formatted
    const formattedUrl = url.startsWith('http') ? url : `${API_CONFIG.BASE_URL}${url}`;
    
    return fetchWithConfig<T>(formattedUrl, {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include', // Include cookies if any
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
   * PATCH request for partial updates
   */
  patch: async <T>(url: string, data: any): Promise<T> => {
    return fetchWithConfig<T>(url, {
      method: 'PATCH',
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
