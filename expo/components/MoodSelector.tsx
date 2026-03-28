import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@/constants/theme';
import type { MoodEntry } from '@/types/user';

interface MoodSelectorProps {
  selectedMood?: MoodEntry['mood'];
  onMoodSelect: (mood: MoodEntry['mood']) => void;
  size?: 'small' | 'large';
}

const moods = [
  { value: 'very-sad' as const, emoji: '😢', label: 'Very Sad', color: '#E17055' },
  { value: 'sad' as const, emoji: '😔', label: 'Sad', color: '#FDCB6E' },
  { value: 'neutral' as const, emoji: '😐', label: 'Neutral', color: '#B2BEC3' },
  { value: 'happy' as const, emoji: '😊', label: 'Happy', color: '#96CEB4' },
  { value: 'very-happy' as const, emoji: '😄', label: 'Very Happy', color: '#4ECDC4' },
];

export default function MoodSelector({ selectedMood, onMoodSelect, size = 'large' }: MoodSelectorProps) {
  const isSmall = size === 'small';

  return (
    <View style={styles.container}>
      {moods.map((mood) => (
        <TouchableOpacity
          key={mood.value}
          style={[
            styles.moodButton,
            isSmall && styles.moodButtonSmall,
            selectedMood === mood.value && [
              styles.selectedMood,
              { borderColor: mood.color }
            ]
          ]}
          onPress={() => onMoodSelect(mood.value)}
          testID={`mood-${mood.value}`}
        >
          <Text style={[styles.emoji, isSmall && styles.emojiSmall]}>
            {mood.emoji}
          </Text>
          <Text style={[styles.label, isSmall && styles.labelSmall]}>
            {mood.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moodButton: {
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 60,
  },
  moodButtonSmall: {
    padding: theme.spacing.sm,
    minWidth: 50,
  },
  selectedMood: {
    backgroundColor: theme.colors.background,
    borderWidth: 2,
  },
  emoji: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  emojiSmall: {
    fontSize: 24,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  labelSmall: {
    fontSize: 10,
  },
});