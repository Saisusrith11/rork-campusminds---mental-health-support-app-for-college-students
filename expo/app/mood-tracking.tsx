import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Smile,
  Frown,
  Meh,
  Heart,
  BarChart3
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useMood } from '@/hooks/mood-store';
import { router } from 'expo-router';
import MoodSelector from '@/components/MoodSelector';



interface MoodAnalysis {
  averageMood: number;
  trend: 'up' | 'down' | 'stable';
  streakDays: number;
  totalEntries: number;
  weeklyAverage: number;
  monthlyAverage: number;
}

const moodValues = {
  'very-sad': 1,
  'sad': 2,
  'neutral': 3,
  'happy': 4,
  'very-happy': 5
};

const moodLabels = {
  'very-sad': 'Very Sad',
  'sad': 'Sad',
  'neutral': 'Neutral',
  'happy': 'Happy',
  'very-happy': 'Very Happy'
};

const moodColors = {
  'very-sad': '#E74C3C',
  'sad': '#F39C12',
  'neutral': '#95A5A6',
  'happy': '#2ECC71',
  'very-happy': '#27AE60'
};

const moodIcons = {
  'very-sad': Frown,
  'sad': Frown,
  'neutral': Meh,
  'happy': Smile,
  'very-happy': Smile
};

export default function MoodTrackingScreen() {
  const { moods, addMoodEntry } = useMood();
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [moodNote, setMoodNote] = useState('');

  const analysis = useMemo((): MoodAnalysis => {
    if (moods.length === 0) {
      return {
        averageMood: 3,
        trend: 'stable',
        streakDays: 0,
        totalEntries: 0,
        weeklyAverage: 3,
        monthlyAverage: 3
      };
    }

    const moodNumbers = moods.map(m => moodValues[m.mood]);
    const averageMood = moodNumbers.reduce((a, b) => a + b, 0) / moodNumbers.length;

    // Calculate trend (last 7 days vs previous 7 days)
    const recent = moods.slice(0, 7).map(m => moodValues[m.mood]);
    const previous = moods.slice(7, 14).map(m => moodValues[m.mood]);
    
    const recentAvg = recent.length > 0 ? recent.reduce((a, b) => a + b, 0) / recent.length : averageMood;
    const previousAvg = previous.length > 0 ? previous.reduce((a, b) => a + b, 0) / previous.length : averageMood;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (recentAvg > previousAvg + 0.3) trend = 'up';
    else if (recentAvg < previousAvg - 0.3) trend = 'down';

    // Calculate streak
    let streakDays = 0;

    let currentDate = new Date();
    
    for (const mood of moods) {
      const moodDate = new Date(mood.timestamp).toDateString();
      const checkDate = currentDate.toDateString();
      
      if (moodDate === checkDate) {
        streakDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Weekly and monthly averages
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const weeklyMoods = moods.filter(m => new Date(m.timestamp) >= weekAgo);
    const monthlyMoods = moods.filter(m => new Date(m.timestamp) >= monthAgo);

    const weeklyAverage = weeklyMoods.length > 0 
      ? weeklyMoods.map(m => moodValues[m.mood]).reduce((a, b) => a + b, 0) / weeklyMoods.length
      : averageMood;

    const monthlyAverage = monthlyMoods.length > 0
      ? monthlyMoods.map(m => moodValues[m.mood]).reduce((a, b) => a + b, 0) / monthlyMoods.length
      : averageMood;

    return {
      averageMood,
      trend,
      streakDays,
      totalEntries: moods.length,
      weeklyAverage,
      monthlyAverage
    };
  }, [moods]);

  const handleMoodSelect = (mood: string) => {
    if (!mood?.trim() || mood.length > 50) return;
    setSelectedMood(mood.trim());
  };

  const handleMoodSubmit = async () => {
    if (!selectedMood?.trim()) return;
    const sanitizedNote = moodNote?.trim().slice(0, 500) || undefined;
    
    try {
      await addMoodEntry(selectedMood as any, sanitizedNote);
      setShowMoodSelector(false);
      setSelectedMood('');
      setMoodNote('');
    } catch (error) {
      console.error('Failed to save mood:', error);
    }
  };

  const getTrendIcon = () => {
    switch (analysis.trend) {
      case 'up': return <TrendingUp size={20} color={theme.colors.success} />;
      case 'down': return <TrendingDown size={20} color={theme.colors.error} />;
      default: return <Minus size={20} color={theme.colors.textSecondary} />;
    }
  };

  const getTrendText = () => {
    switch (analysis.trend) {
      case 'up': return 'Improving';
      case 'down': return 'Declining';
      default: return 'Stable';
    }
  };

  const getTrendColor = () => {
    switch (analysis.trend) {
      case 'up': return theme.colors.success;
      case 'down': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const recentMoods = moods.slice(0, 14); // Last 14 days

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mood Tracking</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Quick Mood Entry */}
        <View style={styles.quickEntrySection}>
          <Text style={styles.sectionTitle}>How are you feeling today?</Text>
          <TouchableOpacity 
            style={styles.quickEntryButton}
            onPress={() => setShowMoodSelector(true)}
          >
            <Heart size={24} color={theme.colors.primary} />
            <Text style={styles.quickEntryText}>Track Your Mood</Text>
          </TouchableOpacity>
        </View>

        {/* Analysis Cards */}
        <View style={styles.analysisSection}>
          <Text style={styles.sectionTitle}>Your Mental Health Insights</Text>
          
          <View style={styles.analysisGrid}>
            <View style={styles.analysisCard}>
              <BarChart3 size={24} color={theme.colors.primary} />
              <Text style={styles.analysisValue}>{analysis.totalEntries}</Text>
              <Text style={styles.analysisLabel}>Total Entries</Text>
            </View>
            
            <View style={styles.analysisCard}>
              <Calendar size={24} color={theme.colors.focus} />
              <Text style={styles.analysisValue}>{analysis.streakDays}</Text>
              <Text style={styles.analysisLabel}>Day Streak</Text>
            </View>
            
            <View style={styles.analysisCard}>
              {getTrendIcon()}
              <Text style={[styles.analysisValue, { color: getTrendColor() }]}>
                {getTrendText()}
              </Text>
              <Text style={styles.analysisLabel}>7-Day Trend</Text>
            </View>
          </View>

          <View style={styles.averageSection}>
            <View style={styles.averageCard}>
              <Text style={styles.averageTitle}>Weekly Average</Text>
              <Text style={styles.averageValue}>{analysis.weeklyAverage.toFixed(1)}/5</Text>
              <View style={styles.averageBar}>
                <View 
                  style={[
                    styles.averageProgress, 
                    { width: `${(analysis.weeklyAverage / 5) * 100}%` }
                  ]} 
                />
              </View>
            </View>
            
            <View style={styles.averageCard}>
              <Text style={styles.averageTitle}>Monthly Average</Text>
              <Text style={styles.averageValue}>{analysis.monthlyAverage.toFixed(1)}/5</Text>
              <View style={styles.averageBar}>
                <View 
                  style={[
                    styles.averageProgress, 
                    { width: `${(analysis.monthlyAverage / 5) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>

        {/* Recent Mood History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Mood History</Text>
          {recentMoods.length > 0 ? (
            <View style={styles.moodHistory}>
              {recentMoods.map((mood, index) => {
                const MoodIcon = moodIcons[mood.mood];
                const date = new Date(mood.timestamp);
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <View key={mood.id} style={styles.moodHistoryItem}>
                    <View style={styles.moodHistoryLeft}>
                      <View 
                        style={[
                          styles.moodIcon, 
                          { backgroundColor: moodColors[mood.mood] + '20' }
                        ]}
                      >
                        <MoodIcon size={20} color={moodColors[mood.mood]} />
                      </View>
                      <View style={styles.moodHistoryInfo}>
                        <Text style={styles.moodHistoryLabel}>
                          {moodLabels[mood.mood]}
                        </Text>
                        <Text style={styles.moodHistoryDate}>
                          {isToday ? 'Today' : date.toLocaleDateString()}
                        </Text>
                        {mood.note && (
                          <Text style={styles.moodHistoryNote}>{mood.note}</Text>
                        )}
                      </View>
                    </View>
                    <Text style={styles.moodHistoryTime}>
                      {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Heart size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyStateText}>No mood entries yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start tracking your mood to see insights and patterns
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Mood Selector Modal */}
      <Modal
        visible={showMoodSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMoodSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>How are you feeling?</Text>
            
            <MoodSelector
              selectedMood={selectedMood as any}
              onMoodSelect={handleMoodSelect}
            />
            
            <TextInput
              style={styles.noteInput}
              placeholder="Add a note (optional)"
              value={moodNote}
              onChangeText={setMoodNote}
              multiline
              maxLength={500}
              placeholderTextColor={theme.colors.textSecondary}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowMoodSelector(false);
                  setSelectedMood('');
                  setMoodNote('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !selectedMood && styles.submitButtonDisabled
                ]}
                onPress={handleMoodSubmit}
                disabled={!selectedMood}
              >
                <Text style={[
                  styles.submitButtonText,
                  !selectedMood && styles.submitButtonTextDisabled
                ]}>Save Mood</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  quickEntrySection: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  quickEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickEntryText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  analysisSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  analysisGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  analysisCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.sm,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  analysisValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  analysisLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  averageSection: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  averageCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  averageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  averageValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  averageBar: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  averageProgress: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  historySection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  moodHistory: {
    gap: theme.spacing.sm,
  },
  moodHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    elevation: 1,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  moodHistoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  moodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  moodHistoryInfo: {
    flex: 1,
  },
  moodHistoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  moodHistoryDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  moodHistoryNote: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  moodHistoryTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  noteInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    fontSize: 16,
    color: theme.colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  submitButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  submitButtonTextDisabled: {
    color: theme.colors.textSecondary,
  },
});