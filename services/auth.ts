// Authentication API Service
import { apiService, setAuthToken, removeAuthToken } from './api';
import type { User } from '@/types/user';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  name: string;
  role: 'student' | 'counselor' | 'volunteer' | 'admin';
  college?: string;
  // Student fields
  studentId?: string;
  year?: string;
  department?: string;
  emergencyContact?: string;
  // Counselor fields
  licenseNumber?: string;
  specializations?: string[];
  experience?: string;
  qualifications?: string;
  // Volunteer fields
  volunteerType?: string;
  availability?: string;
  trainingCompleted?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

class AuthService {
  async login(credentials: LoginRequest) {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials, false);
    
    if (response.success && response.data) {
      await setAuthToken(response.data.token);
    }
    
    return response;
  }

  async register(userData: RegisterRequest) {
    const response = await apiService.post<AuthResponse>('/auth/register', userData, false);
    
    if (response.success && response.data) {
      await setAuthToken(response.data.token);
    }
    
    return response;
  }

  async logout() {
    const response = await apiService.post('/auth/logout');
    await removeAuthToken();
    return response;
  }

  async getCurrentUser() {
    return apiService.get<{ user: User }>('/auth/me');
  }

  async refreshToken() {
    return apiService.post<AuthResponse>('/auth/refresh');
  }
}

export const authService = new AuthService();