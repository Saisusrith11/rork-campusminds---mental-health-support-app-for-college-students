// Mood Tracking API Service
import { apiService } from './api';
import type { MoodEntry } from '@/types/user';

export interface CreateMoodRequest {
  mood: 'very-sad' | 'sad' | 'neutral' | 'happy' | 'very-happy';
  note?: string;
}

export interface MoodAnalytics {
  weeklyMoods: Array<{
    mood: string;
    count: number;
    date: string;
  }>;
  moodTrend: Array<{
    mood_score: number;
    date: string;
  }>;
  averageScore: number;
}

class MoodService {
  async getMoods() {
    return apiService.get<MoodEntry[]>('/moods');
  }

  async createMoodEntry(moodData: CreateMoodRequest) {
    return apiService.post<MoodEntry>('/moods', moodData);
  }

  async getMoodAnalytics() {
    return apiService.get<MoodAnalytics>('/moods/analytics');
  }

  async getTodaysMood() {
    const response = await this.getMoods();
    if (response.success && response.data) {
      const today = new Date().toDateString();
      return response.data.find(mood => 
        new Date(mood.timestamp).toDateString() === today
      );
    }
    return null;
  }

  async getWeeklyMoods() {
    const response = await this.getMoods();
    if (response.success && response.data) {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      return response.data.filter(mood => 
        new Date(mood.timestamp) >= weekAgo
      );
    }
    return [];
  }
}

export const moodService = new MoodService();