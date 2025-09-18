import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import type { ChatMessage } from '@/types/user';

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.sender === 'user';
  const isAI = message.sender === 'ai';

  return (
    <View style={[styles.container, isUser && styles.userContainer]}>
      <View style={[
        styles.bubble,
        isUser && styles.userBubble,
        isAI && styles.aiBubble,
      ]}>
        <Text style={[
          styles.text,
          isUser && styles.userText,
        ]}>
          {message.content}
        </Text>
        <Text style={[
          styles.timestamp,
          isUser && styles.userTimestamp,
        ]}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: theme.spacing.xs,
  },
  aiBubble: {
    backgroundColor: theme.colors.secondary,
    borderBottomLeftRadius: theme.spacing.xs,
  },
  text: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.xs,
  },
  userText: {
    color: theme.colors.surface,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});