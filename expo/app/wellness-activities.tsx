import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Heart, 
  Brain, 
  Zap, 
  Moon, 
  BookOpen,
  CheckCircle,
  X
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';

interface WellnessActivity {
  id: string;
  title: string;
  description: string;
  type: 'meditation' | 'breathing' | 'exercise' | 'journaling' | 'mindfulness';
  duration: number;
  instructions: string[];
  category: string;
  completed?: boolean;
}

export default function WellnessActivitiesScreen() {
  const [selectedActivity, setSelectedActivity] = useState<WellnessActivity | null>(null);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);

  const activities: WellnessActivity[] = [
    {
      id: '1',
      title: '5-Minute Deep Breathing',
      description: 'A simple breathing exercise to reduce stress and anxiety',
      type: 'breathing',
      duration: 5,
      category: 'Stress Relief',
      instructions: [
        'Find a comfortable seated position',
        'Close your eyes or soften your gaze',
        'Breathe in slowly through your nose for 4 counts',
        'Hold your breath for 4 counts',
        'Exhale slowly through your mouth for 6 counts',
        'Repeat this cycle for 5 minutes',
        'Notice how your body feels more relaxed'
      ]
    },
    {
      id: '2',
      title: 'Progressive Muscle Relaxation',
      description: 'Release physical tension throughout your body',
      type: 'exercise',
      duration: 15,
      category: 'Physical Wellness',
      instructions: [
        'Lie down in a comfortable position',
        'Start with your toes - tense them for 5 seconds, then relax',
        'Move to your calves - tense and relax',
        'Continue with thighs, abdomen, hands, arms, shoulders',
        'Tense your face muscles, then relax',
        'Take a moment to notice the difference',
        'Breathe deeply and enjoy the relaxation'
      ]
    },
    {
      id: '3',
      title: 'Mindful Meditation',
      description: 'Practice present-moment awareness and inner peace',
      type: 'meditation',
      duration: 10,
      category: 'Mindfulness',
      instructions: [
        'Sit comfortably with your back straight',
        'Close your eyes and focus on your breath',
        'Notice thoughts as they come and go',
        'Do not judge or engage with thoughts',
        'Gently return attention to your breath',
        'If your mind wanders, that is normal',
        'Continue for 10 minutes with compassion for yourself'
      ]
    },
    {
      id: '4',
      title: 'Gratitude Journaling',
      description: 'Reflect on positive aspects of your life',
      type: 'journaling',
      duration: 8,
      category: 'Emotional Wellness',
      instructions: [
        'Get a notebook or use your phone',
        'Write down 3 things you are grateful for today',
        'Be specific about why you are grateful',
        'Include small moments and big achievements',
        'Write about people who support you',
        'Reflect on personal growth you have experienced',
        'End with one positive affirmation about yourself'
      ]
    },
    {
      id: '5',
      title: '5-4-3-2-1 Grounding',
      description: 'Use your senses to stay present and reduce anxiety',
      type: 'mindfulness',
      duration: 7,
      category: 'Anxiety Relief',
      instructions: [
        'Look around and name 5 things you can see',
        'Notice 4 things you can touch or feel',
        'Listen for 3 different sounds around you',
        'Identify 2 things you can smell',
        'Think of 1 thing you can taste',
        'Take three deep breaths',
        'Notice how you feel more grounded and present'
      ]
    },
    {
      id: '6',
      title: 'Sleep Preparation Routine',
      description: 'Prepare your mind and body for restful sleep',
      type: 'meditation',
      duration: 12,
      category: 'Sleep Hygiene',
      instructions: [
        'Dim the lights in your room',
        'Put away electronic devices',
        'Do some gentle stretching',
        'Practice slow, deep breathing',
        'Think of three good things from your day',
        'Visualize a peaceful, calming scene',
        'Allow your body to relax completely'
      ]
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'meditation':
        return <Brain size={24} color={theme.colors.primary} />;
      case 'breathing':
        return <Heart size={24} color={theme.colors.secondary} />;
      case 'exercise':
        return <Zap size={24} color={theme.colors.energy} />;
      case 'journaling':
        return <BookOpen size={24} color={theme.colors.accent} />;
      case 'mindfulness':
        return <Moon size={24} color={theme.colors.calm} />;
      default:
        return <Heart size={24} color={theme.colors.primary} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'meditation':
        return theme.colors.primary;
      case 'breathing':
        return theme.colors.secondary;
      case 'exercise':
        return theme.colors.energy;
      case 'journaling':
        return theme.colors.accent;
      case 'mindfulness':
        return theme.colors.calm;
      default:
        return theme.colors.primary;
    }
  };

  const startActivity = (activity: WellnessActivity) => {
    setSelectedActivity(activity);
    setShowInstructions(true);
  };

  const completeActivity = () => {
    if (selectedActivity) {
      setCompletedActivities(prev => [...prev, selectedActivity.id]);
      setShowInstructions(false);
      setSelectedActivity(null);
    }
  };

  const closeInstructions = () => {
    setShowInstructions(false);
    setSelectedActivity(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Wellness Activities',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.surface,
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={theme.colors.surface} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Interactive Self-Help Activities</Text>
          <Text style={styles.headerSubtitle}>
            Choose from guided exercises designed to support your mental wellness journey
          </Text>
          
          {completedActivities.length > 0 && (
            <View style={styles.progressCard}>
              <CheckCircle size={20} color={theme.colors.success} />
              <Text style={styles.progressText}>
                You have completed {completedActivities.length} activities this week! 🎉
              </Text>
            </View>
          )}
        </View>

        <View style={styles.activitiesContainer}>
          {activities.map((activity) => {
            const isCompleted = completedActivities.includes(activity.id);
            const activityColor = getActivityColor(activity.type);
            
            return (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.activityCard,
                  isCompleted && styles.completedCard
                ]}
                onPress={() => startActivity(activity)}
              >
                <View style={styles.activityHeader}>
                  <View style={[styles.activityIcon, { backgroundColor: `${activityColor}20` }]}>
                    {getActivityIcon(activity.type)}
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityCategory}>{activity.category}</Text>
                    <View style={styles.activityMeta}>
                      <Clock size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.activityDuration}>{activity.duration} min</Text>
                    </View>
                  </View>
                  {isCompleted && (
                    <CheckCircle size={24} color={theme.colors.success} />
                  )}
                </View>
                
                <Text style={styles.activityDescription}>{activity.description}</Text>
                
                <TouchableOpacity 
                  style={[
                    styles.startButton,
                    { backgroundColor: activityColor },
                    isCompleted && styles.completedButton
                  ]}
                  onPress={() => startActivity(activity)}
                >
                  <Play size={16} color={theme.colors.surface} />
                  <Text style={styles.startButtonText}>
                    {isCompleted ? 'Do Again' : 'Start Activity'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Wellness Tips</Text>
          <Text style={styles.tipsText}>
            • Practice activities regularly for best results{'\n'}
            • Start with shorter activities if you are new to wellness practices{'\n'}
            • Find a quiet, comfortable space for your activities{'\n'}
            • Be patient and kind with yourself during the process
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Activity Instructions Modal */}
      <Modal
        visible={showInstructions}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedActivity?.title}</Text>
            <TouchableOpacity onPress={closeInstructions} style={styles.closeButton}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.activityDetails}>
              <View style={styles.detailRow}>
                <Clock size={20} color={theme.colors.primary} />
                <Text style={styles.detailText}>Duration: {selectedActivity?.duration} minutes</Text>
              </View>
              <View style={styles.detailRow}>
                <Heart size={20} color={theme.colors.primary} />
                <Text style={styles.detailText}>Category: {selectedActivity?.category}</Text>
              </View>
            </View>

            <Text style={styles.instructionsTitle}>Step-by-Step Instructions:</Text>
            
            {selectedActivity?.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.completeButton}
                onPress={completeActivity}
              >
                <CheckCircle size={20} color={theme.colors.surface} />
                <Text style={styles.completeButtonText}>Mark as Complete</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  progressCard: {
    backgroundColor: theme.colors.success + '20',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.success + '40',
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
    flex: 1,
  },
  activitiesContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  activityCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  completedCard: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success + '10',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  activityCategory: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
    marginBottom: theme.spacing.sm,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  activityDuration: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  activityDescription: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  completedButton: {
    opacity: 0.8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  tipsCard: {
    margin: theme.spacing.lg,
    backgroundColor: theme.colors.calm,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.focus,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  tipsText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  modalContent: {
    flex: 1,
  },
  activityDetails: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  detailText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  instructionText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    flex: 1,
  },
  modalActions: {
    padding: theme.spacing.lg,
  },
  completeButton: {
    backgroundColor: theme.colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
});