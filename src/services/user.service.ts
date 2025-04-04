import { ApiService } from './api.service';
import { ENDPOINTS } from '../config/endpoints';

export interface User {
  uid: string;
  name?: string;
  given_name?: string;
  middle_name?: string;
  family_name?: string;
  nickname?: string;
  email?: string;
  phone_number?: string;
  comment?: string;
  picture?: string;
  directory?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

export const UserService = {
  /**
   * Get all users
   */
  getAllUsers: async (): Promise<User[]> => {
    return ApiService.get<User[]>(ENDPOINTS.USERS.BASE);
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: string): Promise<User> => {
    return ApiService.get<User>(ENDPOINTS.USERS.BY_ID(userId));
  },

  /**
   * Create new user
   */
  createUser: async (userData: User): Promise<User> => {
    return ApiService.post<User>(ENDPOINTS.USERS.BASE, userData);
  },

  /**
   * Update user
   */
  updateUser: async (userId: string, userData: Partial<User>): Promise<User> => {
    return ApiService.put<User>(ENDPOINTS.USERS.BY_ID(userId), userData);
  },

  /**
   * Delete user
   */
  deleteUser: async (userId: string): Promise<void> => {
    return ApiService.delete<void>(ENDPOINTS.USERS.BY_ID(userId));
  },
};
