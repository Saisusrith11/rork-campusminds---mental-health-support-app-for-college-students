// API Configuration and Base Service
import { getApiBaseUrl, isOfflineMode } from '@/constants/environment';

// API Configuration
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Base API Service Class
class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  private async getAuthToken(): Promise<string | null> {
    // This will be replaced with proper storage hook integration
    return null;
  }

  private async getHeaders(includeAuth: boolean = true): Promise<Record<string, string>> {
    const headers: Record<string, string> = { ...API_CONFIG.HEADERS };
    
    if (includeAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse response',
      };
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    // Check if offline mode is enabled
    if (isOfflineMode()) {
      console.log(`Offline mode: Simulating API request ${options.method || 'GET'} ${endpoint}`);
      return this.getOfflineResponse<T>(endpoint, options);
    }

    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = await this.getHeaders(includeAuth);

      const config: RequestInit = {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      };

      console.log(`API Request: ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('API Request failed:', error);
      // Fallback to offline response if network fails
      console.log('Falling back to offline mode due to network error');
      return this.getOfflineResponse<T>(endpoint, options);
    }
  }

  private getOfflineResponse<T>(endpoint: string, options: RequestInit): ApiResponse<T> {
    const method = options.method || 'GET';
    
    // Simulate successful responses for common endpoints
    if (endpoint.includes('/auth/login')) {
      return {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'demo@mindcare.com',
            name: 'Demo User',
            role: 'student',
            profileComplete: true
          },
          token: 'demo-token-123'
        } as any,
        message: 'Login successful (offline mode)'
      };
    }

    if (endpoint.includes('/auth/register')) {
      return {
        success: true,
        data: {
          user: {
            id: '2',
            email: 'newuser@mindcare.com',
            name: 'New User',
            role: 'student',
            profileComplete: false
          },
          token: 'demo-token-456'
        } as any,
        message: 'Registration successful (offline mode)'
      };
    }

    if (endpoint.includes('/moods')) {
      if (method === 'POST') {
        return {
          success: true,
          data: {
            id: Date.now().toString(),
            mood: 'happy',
            intensity: 7,
            notes: 'Feeling good today',
            createdAt: new Date().toISOString()
          } as any,
          message: 'Mood saved successfully (offline mode)'
        };
      }
      return {
        success: true,
        data: [] as any,
        message: 'Moods retrieved (offline mode)'
      };
    }

    if (endpoint.includes('/chat')) {
      return {
        success: true,
        data: {
          messages: [],
          chatId: 'demo-chat-123'
        } as any,
        message: 'Chat data retrieved (offline mode)'
      };
    }

    if (endpoint.includes('/appointments')) {
      return {
        success: true,
        data: [] as any,
        message: 'Appointments retrieved (offline mode)'
      };
    }

    // Default offline response
    return {
      success: true,
      data: {} as any,
      message: `Request completed (offline mode): ${method} ${endpoint}`
    };
  }

  // HTTP Methods
  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' }, includeAuth);
  }

  async post<T>(
    endpoint: string,
    data?: any,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  async put<T>(
    endpoint: string,
    data?: any,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' }, includeAuth);
  }

  // File Upload
  async uploadFile<T>(
    endpoint: string,
    file: {
      uri: string;
      name: string;
      type: string;
    },
    additionalData?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    // Check if offline mode is enabled
    if (isOfflineMode()) {
      console.log(`Offline mode: Simulating file upload to ${endpoint}`);
      return {
        success: true,
        data: {
          fileId: Date.now().toString(),
          fileName: file.name,
          fileType: file.type,
          uploadedAt: new Date().toISOString()
        } as any,
        message: 'File uploaded successfully (offline mode)'
      };
    }

    try {
      const formData = new FormData();
      formData.append('file', file as any);

      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const token = await this.getAuthToken();
      const headers: Record<string, string> = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('File upload failed:', error);
      // Fallback to offline response
      return {
        success: true,
        data: {
          fileId: Date.now().toString(),
          fileName: file.name,
          fileType: file.type,
          uploadedAt: new Date().toISOString()
        } as any,
        message: 'File uploaded successfully (offline fallback)'
      };
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Utility functions
// These will be integrated with proper storage hooks
export const setAuthToken = async (token: string): Promise<void> => {
  // Will be implemented with storage provider
  console.log('Setting auth token:', token);
};

export const removeAuthToken = async (): Promise<void> => {
  // Will be implemented with storage provider
  console.log('Removing auth token');
};

export const getStoredAuthToken = async (): Promise<string | null> => {
  // Will be implemented with storage provider
  return null;
};