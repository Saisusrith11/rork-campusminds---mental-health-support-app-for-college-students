import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/auth-store';
import { useMood } from '@/hooks/mood-store';
import MoodSelector from '@/components/MoodSelector';
import type { MoodEntry } from '@/types/user';

export default function OnboardingScreen() {
  const { user, updateUser } = useAuth();
  const { addMoodEntry } = useMood();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMood, setSelectedMood] = useState<MoodEntry['mood']>();
  const [moodNote, setMoodNote] = useState('');

  const steps = [
    {
      title: 'Welcome to CampusMinds',
      subtitle: 'Let\'s personalize your mental health journey',
      content: (
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeText}>
            Hi {user?.name}! 👋{'\n\n'}
            We're here to support your mental wellness throughout your college journey.
            Let's start by understanding how you're feeling today.
          </Text>
        </View>
      ),
    },
    {
      title: 'How are you feeling today?',
      subtitle: 'Your daily check-in helps us provide better support',
      content: (
        <View style={styles.moodContent}>
          <MoodSelector
            selectedMood={selectedMood}
            onMoodSelect={setSelectedMood}
          />
          <TextInput
            style={styles.noteInput}
            value={moodNote}
            onChangeText={setMoodNote}
            placeholder="Tell us more about how you're feeling (optional)"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      ),
    },
  ];

  const handleNext = async () => {
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      if (!selectedMood) {
        Alert.alert('Please select your mood', 'This helps us understand how you\'re feeling');
        return;
      }

      try {
        await addMoodEntry(selectedMood, moodNote);
        await updateUser({ isOnboarded: true });
        router.replace('/(tabs)/home');
      } catch (error) {
        Alert.alert('Error', 'Failed to save your mood. Please try again.');
      }
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.progressContainer}>
              {steps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index <= currentStep && styles.progressDotActive
                  ]}
                />
              ))}
            </View>
            
            <Text style={styles.title}>{currentStepData.title}</Text>
            <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
          </View>

          <View style={styles.stepContent}>
            {currentStepData.content}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              testID="next-button"
            >
              <Text style={styles.nextButtonText}>
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotActive: {
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.surface,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: theme.colors.surface,
    textAlign: 'center',
    lineHeight: 28,
  },
  moodContent: {
    gap: theme.spacing.xl,
  },
  noteInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    minHeight: 80,
  },
  footer: {
    paddingTop: theme.spacing.lg,
  },
  nextButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});