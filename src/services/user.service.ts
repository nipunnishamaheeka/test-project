import { ApiService } from './api.service';
import { ENDPOINTS } from '../config/endpoints';

export interface UserPicture {
  id: number;
  name: string;
  media_type: string;
  width: number;
  height: number;
  size: number;
  thumbnail_url: string;
  raw: string;
}

export interface UserDirectory {
  id: number;
  name: string;
}

export interface User {
  id?: number;
  uid: string;
  name?: string;
  given_name?: string;
  middle_name?: string;
  family_name?: string;
  nickname?: string;
  email?: string;
  phone_number?: string;
  avatar_url?: string;
  picture?: UserPicture | string;
  directory?: UserDirectory | string; 
  presence?: string;
  comment?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  is_trashed?: boolean;
}

export interface UserListResponse {
  data: User[];
  start: number;
  end: number;
  count: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export const UserService = {
  /**
   * Get all users
   * @param take Optional number of users to retrieve
   */
  getAllUsers: async (take?: number): Promise<User[]> => {
    const url = take ? `${ENDPOINTS.USERS.BASE}?take=${take}` : ENDPOINTS.USERS.BASE;
    const response = await ApiService.get<UserListResponse>(url);
    return response.data || [];
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: string): Promise<User> => {
    return ApiService.get<User>(ENDPOINTS.USERS.BY_ID(userId));
  },

  /**
   * Get authenticated user (current user)
   */
  getAuthenticatedUser: async (): Promise<User> => {
    return ApiService.get<User>(ENDPOINTS.USERS.GET_AUTHENTICATED);
  },

  /**
   * Create new user with improved error handling
   */
  createUser: async (userData: Partial<User>): Promise<User> => {
    const userDataToSend = JSON.parse(JSON.stringify(userData));
    
    try {
      if (userDataToSend.directory) {
        if (typeof userDataToSend.directory === 'object') {
          userDataToSend.directory = (userDataToSend.directory as UserDirectory).name;
        }
      }
      
      if (userDataToSend.metadata && typeof userDataToSend.metadata === 'string') {
        try {
          userDataToSend.metadata = JSON.parse(userDataToSend.metadata);
        } catch {
          delete userDataToSend.metadata;
        }
      }
      
      if (userDataToSend.picture) {
        if (typeof userDataToSend.picture === 'string') {
          if (userDataToSend.picture.startsWith('data:image')) {
          } else if (!userDataToSend.picture.startsWith('http')) {
            delete userDataToSend.picture;
          }
        }
      }
      
      // Remove empty fields to avoid validation issues
      Object.keys(userDataToSend).forEach(key => {
        const value = userDataToSend[key as keyof typeof userDataToSend];
        if (value === '' || value === null || value === undefined) {
          delete userDataToSend[key as keyof typeof userDataToSend];
        }
      });

      console.log('Sending user data to API:', userDataToSend);
      console.log('API endpoint:', ENDPOINTS.USERS.BASE);
      
      // Verify the endpoint is correctly formed
      if (!ENDPOINTS.USERS.BASE) {
        throw new Error('Invalid API endpoint for user creation');
      }
      
      const response = await ApiService.post<User>(ENDPOINTS.USERS.BASE, userDataToSend);
      
      console.log('User creation successful:', response);
      return response;
    } catch (error) {
      console.error('User creation error:', error);
      // Add more detailed error information
      if (error instanceof Error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }
      throw new Error('Failed to create user: Unknown error');
    }
  },

  /**
   * Update user (full update)
   */
  updateUser: async (userId: string, userData: Partial<User>): Promise<User> => {
    // Handle directory if it's a string (convert to expected format)
    if (typeof userData.directory === 'string' && userData.directory) {
      userData.directory = { name: userData.directory } as UserDirectory;
    }
    
    return ApiService.put<User>(ENDPOINTS.USERS.BY_ID(userId), userData);
  },

  /**
   * Partially update user
   */
  patchUser: async (userId: string, userData: Partial<User>): Promise<User> => {
    // Handle directory if it's a string (convert to expected format)
    if (typeof userData.directory === 'string' && userData.directory) {
      userData.directory = { name: userData.directory } as UserDirectory;
    }
    
    return ApiService.patch<User>(ENDPOINTS.USERS.BY_ID(userId), userData);
  },

  /**
   * Delete user
   */
  deleteUser: async (userId: string): Promise<void> => {
    return ApiService.delete<void>(ENDPOINTS.USERS.BY_ID(userId));
  },

  /**
   * Create access token for a user
   */
  createAccessToken: async (userId: string, expiresIn?: number): Promise<TokenResponse> => {
    const data = expiresIn ? { expires_in: expiresIn } : {};
    return ApiService.post<TokenResponse>(ENDPOINTS.USERS.TOKENS(userId), data);
  },

  /**
   * Trash a user (soft delete)
   */
  trashUser: async (userId: string): Promise<void> => {
    return ApiService.post<void>(ENDPOINTS.USERS.TRASH(userId), {});
  },

  /**
   * Restore a trashed user
   */
  restoreUser: async (userId: string): Promise<User> => {
    return ApiService.post<User>(ENDPOINTS.USERS.RESTORE(userId), {});
  }
};
