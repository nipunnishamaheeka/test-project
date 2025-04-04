import { API_CONFIG } from './api.config';

const { BASE_URL } = API_CONFIG;

export const ENDPOINTS = {
  USERS: {
    BASE: `${BASE_URL}/api/users`,
    BY_ID: (userId: string) => `${BASE_URL}/api/users/${userId}`,
    GET_AUTHENTICATED: `${BASE_URL}/api/user`,
    TOKENS: (userId: string) => `${BASE_URL}/api/users/${userId}/tokens`,
    TRASH: (userId: string) => `${BASE_URL}/api/users/${userId}/trash`,
    RESTORE: (userId: string) => `${BASE_URL}/api/users/${userId}/restore`,
  }
};
