import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import type { MoodEntry } from '@/types/user';

const STORAGE_KEY = 'campusminds_moods';

export const [MoodProvider, useMood] = createContextHook(() => {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMoods();
  }, []);

  const loadMoods = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored && stored.trim()) {
        try {
          const parsed = JSON.parse(stored);
          setMoods(Array.isArray(parsed) ? parsed : []);
        } catch (parseError) {
          console.error('Failed to parse moods data, clearing storage:', parseError);
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to load moods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMoods = async (newMoods: MoodEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMoods));
      setMoods(newMoods);
    } catch (error) {
      console.error('Failed to save moods:', error);
      throw error;
    }
  };

  const addMoodEntry = async (mood: MoodEntry['mood'], note?: string) => {
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      userId: 'current-user',
      mood,
      note,
      timestamp: new Date().toISOString(),
    };

    const updatedMoods = [newEntry, ...moods];
    await saveMoods(updatedMoods);
  };

  const getTodaysMood = () => {
    const today = new Date().toDateString();
    return moods.find(mood => 
      new Date(mood.timestamp).toDateString() === today
    );
  };

  const getWeeklyMoods = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return moods.filter(mood => 
      new Date(mood.timestamp) >= weekAgo
    );
  };

  return {
    moods,
    isLoading,
    addMoodEntry,
    getTodaysMood,
    getWeeklyMoods,
  };
});