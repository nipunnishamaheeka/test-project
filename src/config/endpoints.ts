import { API_CONFIG } from './api.config';

const { BASE_URL } = API_CONFIG;

export const ENDPOINTS = {
  USERS: {
    BASE: `${BASE_URL}/users`,
    BY_ID: (userId: string) => `${BASE_URL}/users/${userId}`,
  },
  // Add other endpoints as needed
};
