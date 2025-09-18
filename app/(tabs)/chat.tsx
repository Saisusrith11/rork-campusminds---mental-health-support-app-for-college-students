import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle, Users } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/auth-store';
import { useLanguage } from '@/hooks/language-store';
import { router } from 'expo-router';

// Mock chat sessions for different roles
const mockChatSessions = {
  student: [
    {
      id: 'counselor_1',
      name: 'Dr. Meera Patel',
      role: 'counselor',
      avatar: '👩‍⚕️',
      isOnline: true,
      lastMessage: 'How are you feeling today?',
      lastMessageTime: '2 min ago',
      unreadCount: 1
    },
    {
      id: 'volunteer_1', 
      name: 'Kavya Nair',
      role: 'volunteer',
      avatar: '👥',
      isOnline: true,
      lastMessage: 'I understand your concerns...',
      lastMessageTime: '1 hour ago',
      unreadCount: 0
    }
  ],
  counselor: [
    {
      id: 'student_1',
      name: 'Arjun Kumar',
      role: 'student',
      avatar: '👨‍🎓',
      isOnline: false,
      lastMessage: 'Thank you for the session',
      lastMessageTime: '30 min ago',
      unreadCount: 2,
      riskLevel: 'moderate'
    },
    {
      id: 'student_2',
      name: 'Priya Sharma', 
      role: 'student',
      avatar: '👩‍🎓',
      isOnline: true,
      lastMessage: 'I\'m feeling anxious about exams',
      lastMessageTime: '5 min ago',
      unreadCount: 1,
      riskLevel: 'high'
    }
  ],
  volunteer: [
    {
      id: 'student_3',
      name: 'Anonymous Student',
      role: 'student',
      avatar: '❓',
      isOnline: true,
      lastMessage: 'I need someone to talk to',
      lastMessageTime: 'Just now',
      unreadCount: 3,
      isAnonymous: true
    },
    {
      id: 'student_4',
      name: 'Rahul Singh',
      role: 'student', 
      avatar: '👨‍🎓',
      isOnline: false,
      lastMessage: 'Thanks for your support',
      lastMessageTime: '2 hours ago',
      unreadCount: 0
    }
  ]
};

export default function ChatScreen() {
  const { user } = useAuth();
  const { translate } = useLanguage();
  const insets = useSafeAreaInsets();
  
  const getChatSessions = () => {
    if (!user) return [];
    return mockChatSessions[user.role as keyof typeof mockChatSessions] || [];
  };
  
  const getScreenTitle = () => {
    if (!user) return translate('nav.chat', 'Chat');
    
    switch (user.role) {
      case 'student':
        return translate('chat.student.title', 'Support Chat');
      case 'counselor':
        return translate('chat.counselor.title', 'Student Sessions');
      case 'volunteer':
        return translate('chat.volunteer.title', 'Peer Support');
      default:
        return translate('nav.chat', 'Chat');
    }
  };
  
  const getScreenSubtitle = () => {
    if (!user) return '';
    
    switch (user.role) {
      case 'student':
        return translate('chat.student.subtitle', 'Connect with counselors and volunteers');
      case 'counselor':
        return translate('chat.counselor.subtitle', 'Chat with your assigned students');
      case 'volunteer':
        return translate('chat.volunteer.subtitle', 'Support students who need help');
      default:
        return '';
    }
  };
  
  const handleChatPress = (chatSession: any) => {
    router.push(`/chat/${chatSession.role}?userId=${chatSession.id}`);
  };
  
  const renderChatSession = (session: any) => {
    const getRiskLevelColor = (level?: string) => {
      switch (level) {
        case 'high': return theme.colors.error;
        case 'moderate': return theme.colors.warning;
        case 'minimal': return theme.colors.success;
        default: return theme.colors.textSecondary;
      }
    };
    
    return (
      <TouchableOpacity
        key={session.id}
        style={styles.chatSessionItem}
        onPress={() => handleChatPress(session)}
      >
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{session.avatar}</Text>
          {session.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>
              {session.isAnonymous ? translate('chat.anonymous', 'Anonymous Student') : session.name}
            </Text>
            <Text style={styles.chatTime}>{session.lastMessageTime}</Text>
          </View>
          
          <View style={styles.chatPreview}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {session.lastMessage}
            </Text>
            {session.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{session.unreadCount}</Text>
              </View>
            )}
          </View>
          
          {session.riskLevel && user?.role === 'counselor' && (
            <View style={styles.riskIndicator}>
              <View style={[styles.riskDot, { backgroundColor: getRiskLevelColor(session.riskLevel) }]} />
              <Text style={[styles.riskText, { color: getRiskLevelColor(session.riskLevel) }]}>
                {translate(`risk.${session.riskLevel}`, session.riskLevel)} {translate('risk.level', 'risk')}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  const chatSessions = getChatSessions();

  const handleNewChat = () => {
    if (user?.role === 'student') {
      // Show options to chat with counselor or volunteer
      router.push('/chat/counselor');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <MessageCircle size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
            <Text style={styles.headerSubtitle}>{getScreenSubtitle()}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
        {chatSessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>
              {translate('chat.empty.title', 'No active chats')}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {user?.role === 'student' 
                ? translate('chat.empty.student', 'Start a conversation with a counselor or volunteer')
                : translate('chat.empty.helper', 'Students will appear here when they need support')
              }
            </Text>
            {user?.role === 'student' && (
              <TouchableOpacity style={styles.startChatButton} onPress={handleNewChat}>
                <Text style={styles.startChatButtonText}>
                  {translate('chat.start', 'Start New Chat')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.chatSessionsList}>
            {chatSessions.map(renderChatSession)}
          </View>
        )}
      </ScrollView>
      
      {user?.role === 'student' && chatSessions.length > 0 && (
        <TouchableOpacity style={styles.floatingButton} onPress={handleNewChat}>
          <MessageCircle size={24} color={theme.colors.surface} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  chatList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  startChatButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.xl,
  },
  startChatButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  chatSessionsList: {
    paddingVertical: theme.spacing.sm,
  },
  chatSessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    position: 'relative',
  },
  avatarText: {
    fontSize: 20,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  chatTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  chatPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  unreadCount: {
    color: theme.colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  riskIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  floatingButton: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});