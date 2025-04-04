/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: 'https://8015b5dbc0724d38882ac90397c27649.weavy.io',
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer wys_hMWpXdekxcn9Gc8Ioah3azOllzUZ7l3HN9yB',
  },
  ENDPOINTS: {
    USERS: '/api/users',
    USER: '/api/user', 
    USER_BY_ID: (uid: string) => `/api/users/${uid}`,
    USER_TOKENS: (uid: string) => `/api/users/${uid}/tokens`,
    USER_TRASH: (uid: string) => `/api/users/${uid}/trash`,
  },
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  NOT_FOUND: 'Resource not found.',
  UNAUTHORIZED: 'Unauthorized. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  DEFAULT: 'An error occurred. Please try again.',
};
