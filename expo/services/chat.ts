// Chat API Service
import { apiService } from './api';
import type { ChatMessage, ChatSession } from '@/types/user';

export interface CreateChatSessionRequest {
  type: 'ai' | 'counselor' | 'volunteer';
  participantId?: string;
}

export interface SendMessageRequest {
  content: string;
  messageType?: 'text' | 'image' | 'file';
}

class ChatService {
  async getChatSessions() {
    return apiService.get<ChatSession[]>('/chat/sessions');
  }

  async createChatSession(sessionData: CreateChatSessionRequest) {
    return apiService.post<ChatSession>('/chat/sessions', sessionData);
  }

  async getMessages(sessionId: string) {
    return apiService.get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`);
  }

  async sendMessage(sessionId: string, messageData: SendMessageRequest) {
    return apiService.post<ChatMessage>(`/chat/sessions/${sessionId}/messages`, messageData);
  }

  async endChatSession(sessionId: string) {
    return apiService.put(`/chat/sessions/${sessionId}`, { isActive: false });
  }

  // Get chat sessions by type
  async getChatSessionsByType(type: 'ai' | 'counselor' | 'volunteer') {
    const response = await this.getChatSessions();
    if (response.success && response.data) {
      return response.data.filter(session => session.type === type);
    }
    return [];
  }

  // Get active chat sessions
  async getActiveChatSessions() {
    const response = await this.getChatSessions();
    if (response.success && response.data) {
      return response.data.filter(session => session.isActive);
    }
    return [];
  }
}

export const chatService = new ChatService();