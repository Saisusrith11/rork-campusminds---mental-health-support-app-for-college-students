import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Clock, Play, BookOpen, Headphones } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import type { Resource } from '@/types/user';

interface ResourceCardProps {
  resource: Resource;
  onPress: () => void;
}

const getTypeIcon = (type: Resource['type']) => {
  switch (type) {
    case 'video':
      return <Play size={16} color={theme.colors.primary} />;
    case 'audio':
      return <Headphones size={16} color={theme.colors.primary} />;
    case 'exercise':
      return <Play size={16} color={theme.colors.primary} />;
    default:
      return <BookOpen size={16} color={theme.colors.primary} />;
  }
};

export default function ResourceCard({ resource, onPress }: ResourceCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} testID={`resource-${resource.id}`}>
      {resource.imageUrl && (
        <Image source={{ uri: resource.imageUrl }} style={styles.image} />
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            {getTypeIcon(resource.type)}
            <Text style={styles.category}>{resource.category}</Text>
          </View>
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  category: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  duration: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});