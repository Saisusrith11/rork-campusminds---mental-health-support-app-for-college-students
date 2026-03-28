import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Play, Clock, BookOpen, Headphones } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { resources } from '@/data/resources';

export default function ResourceDetailScreen() {
  const { id } = useLocalSearchParams();
  const resource = resources.find(r => r.id === id);

  if (!resource) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Resource not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getTypeIcon = () => {
    switch (resource.type) {
      case 'video':
        return <Play size={20} color={theme.colors.surface} />;
      case 'audio':
        return <Headphones size={20} color={theme.colors.surface} />;
      case 'exercise':
        return <Play size={20} color={theme.colors.surface} />;
      default:
        return <BookOpen size={20} color={theme.colors.surface} />;
    }
  };

  const getActionText = () => {
    switch (resource.type) {
      case 'video':
        return 'Watch Video';
      case 'audio':
        return 'Listen Now';
      case 'exercise':
        return 'Start Exercise';
      default:
        return 'Read Article';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {resource.imageUrl && (
          <Image source={{ uri: resource.imageUrl }} style={styles.heroImage} />
        )}

        <View style={styles.content}>
          <View style={styles.resourceHeader}>
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>{resource.category}</Text>
              {resource.duration && (
                <View style={styles.durationContainer}>
                  <Clock size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.duration}>{resource.duration}</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.title}>{resource.title}</Text>
            <Text style={styles.description}>{resource.description}</Text>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => console.log(`Starting ${resource.type}: ${resource.title}`)}
            testID="action-button"
          >
            {getTypeIcon()}
            <Text style={styles.actionButtonText}>{getActionText()}</Text>
          </TouchableOpacity>

          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>About this {resource.type}</Text>
            <Text style={styles.contentText}>
              {resource.content || 'This resource will help you on your wellness journey. Take your time and remember that every small step counts towards better mental health.'}
            </Text>
          </View>

          {resource.type === 'exercise' && (
            <View style={styles.instructionsSection}>
              <Text style={styles.sectionTitle}>Instructions</Text>
              <View style={styles.instructionsList}>
                <View style={styles.instructionItem}>
                  <Text style={styles.instructionNumber}>1</Text>
                  <Text style={styles.instructionText}>Find a quiet, comfortable space</Text>
                </View>
                <View style={styles.instructionItem}>
                  <Text style={styles.instructionNumber}>2</Text>
                  <Text style={styles.instructionText}>Sit or lie down in a relaxed position</Text>
                </View>
                <View style={styles.instructionItem}>
                  <Text style={styles.instructionNumber}>3</Text>
                  <Text style={styles.instructionText}>Follow the guided instructions</Text>
                </View>
                <View style={styles.instructionItem}>
                  <Text style={styles.instructionNumber}>4</Text>
                  <Text style={styles.instructionText}>Take your time and be patient with yourself</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.tipSection}>
            <Text style={styles.tipTitle}>💡 Tip</Text>
            <Text style={styles.tipText}>
              Regular practice makes these techniques more effective. Try to incorporate this into your daily routine for the best results.
            </Text>
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: theme.spacing.lg,
  },
  resourceHeader: {
    marginBottom: theme.spacing.xl,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  category: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  duration: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    lineHeight: 36,
  },
  description: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    lineHeight: 26,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  contentSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  contentText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  instructionsSection: {
    marginBottom: theme.spacing.xl,
  },
  instructionsList: {
    gap: theme.spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
  },
  tipSection: {
    backgroundColor: theme.colors.calm,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  tipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
});