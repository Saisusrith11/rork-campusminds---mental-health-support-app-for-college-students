import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { 
  ArrowLeft, 
  Plus, 
  MessageCircle, 
  Heart, 
  User, 
  Send,
  X,
  Users
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';

interface CommunityPost {
  id: string;
  content: string;
  isAnonymous: boolean;
  timestamp: string;
  responses: CommunityResponse[];
  category?: string;
}

interface CommunityResponse {
  id: string;
  content: string;
  authorName: string;
  authorRole: 'volunteer' | 'counselor' | 'student';
  timestamp: string;
  isApproved: boolean;
}

interface Volunteer {
  id: string;
  name: string;
  specialty: string;
  isOnline: boolean;
}

export default function CommunityScreen() {
  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: '1',
      content: 'I have been feeling really overwhelmed with my coursework lately. Does anyone have tips for managing academic stress?',
      isAnonymous: true,
      timestamp: '2 hours ago',
      category: 'Academic Stress',
      responses: [
        {
          id: '1',
          content: 'I understand how you feel. Try breaking your tasks into smaller, manageable chunks. The Pomodoro technique has really helped me stay focused.',
          authorName: 'Sarah M.',
          authorRole: 'volunteer',
          timestamp: '1 hour ago',
          isApproved: true
        },
        {
          id: '2',
          content: 'Academic stress is very common. Consider reaching out to your professors during office hours - they are often more understanding than you might expect.',
          authorName: 'Dr. Johnson',
          authorRole: 'counselor',
          timestamp: '45 minutes ago',
          isApproved: true
        }
      ]
    },
    {
      id: '2',
      content: 'Has anyone tried meditation for anxiety? I am curious about starting but do not know where to begin.',
      isAnonymous: false,
      timestamp: '5 hours ago',
      category: 'Anxiety',
      responses: [
        {
          id: '3',
          content: 'Meditation has been a game-changer for my anxiety! Start with just 5 minutes a day using a guided app. Our wellness activities section has some great beginner exercises.',
          authorName: 'Alex K.',
          authorRole: 'volunteer',
          timestamp: '3 hours ago',
          isApproved: true
        }
      ]
    },
    {
      id: '3',
      content: 'I am struggling with sleep issues and it is affecting my daily life. Any advice would be appreciated.',
      isAnonymous: true,
      timestamp: '1 day ago',
      category: 'Sleep',
      responses: [
        {
          id: '4',
          content: 'Sleep hygiene is crucial. Try to maintain a consistent sleep schedule and avoid screens an hour before bed. Our sleep preparation routine in wellness activities might help.',
          authorName: 'Maria L.',
          authorRole: 'volunteer',
          timestamp: '20 hours ago',
          isApproved: true
        }
      ]
    }
  ]);

  const [volunteers] = useState<Volunteer[]>([
    { id: '1', name: 'Sarah M.', specialty: 'Academic Stress', isOnline: true },
    { id: '2', name: 'Alex K.', specialty: 'Anxiety & Mindfulness', isOnline: true },
    { id: '3', name: 'Maria L.', specialty: 'Sleep & Wellness', isOnline: false },
    { id: '4', name: 'Jordan P.', specialty: 'Depression Support', isOnline: true },
    { id: '5', name: 'Taylor R.', specialty: 'Stress Management', isOnline: true }
  ]);

  const [showNewPostModal, setShowNewPostModal] = useState<boolean>(false);
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      Alert.alert('Error', 'Please enter your question or message.');
      return;
    }

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      content: newPostContent,
      isAnonymous,
      timestamp: 'Just now',
      responses: []
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostContent('');
    setShowNewPostModal(false);
    Alert.alert('Success', 'Your post has been shared with the community!');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'counselor':
        return theme.colors.primary;
      case 'volunteer':
        return theme.colors.secondary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'counselor':
        return 'Professional Counselor';
      case 'volunteer':
        return 'Peer Volunteer';
      default:
        return 'Student';
    }
  };

  const startChatWithVolunteer = (volunteer: Volunteer) => {
    if (!volunteer.isOnline) {
      Alert.alert('Volunteer Offline', `${volunteer.name} is currently offline. Please try again later or contact another volunteer.`);
      return;
    }
    
    Alert.alert(
      'Start Chat',
      `Would you like to start a private chat with ${volunteer.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Chat', onPress: () => {
          // Navigate to chat screen - for now just show success
          Alert.alert('Chat Started', `You are now connected with ${volunteer.name}. This would open a secure chat window.`);
        }}
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Community Support',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.surface,
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={theme.colors.surface} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => setShowNewPostModal(true)} 
              style={styles.addButton}
            >
              <Plus size={24} color={theme.colors.surface} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Community Support Forum</Text>
          <Text style={styles.headerSubtitle}>
            Share your experiences, ask questions, and connect with volunteers for support
          </Text>
        </View>

        {/* Available Volunteers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Volunteers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.volunteersScroll}>
            {volunteers.map((volunteer) => (
              <TouchableOpacity
                key={volunteer.id}
                style={[
                  styles.volunteerCard,
                  !volunteer.isOnline && styles.volunteerOffline
                ]}
                onPress={() => startChatWithVolunteer(volunteer)}
              >
                <View style={styles.volunteerAvatar}>
                  <User size={20} color={theme.colors.primary} />
                  {volunteer.isOnline && <View style={styles.onlineIndicator} />}
                </View>
                <Text style={styles.volunteerName}>{volunteer.name}</Text>
                <Text style={styles.volunteerSpecialty}>{volunteer.specialty}</Text>
                <TouchableOpacity 
                  style={[
                    styles.contactButton,
                    !volunteer.isOnline && styles.contactButtonDisabled
                  ]}
                  onPress={() => startChatWithVolunteer(volunteer)}
                  disabled={!volunteer.isOnline}
                >
                  <Text style={[
                    styles.contactButtonText,
                    !volunteer.isOnline && styles.contactButtonTextDisabled
                  ]}>
                    {volunteer.isOnline ? 'Contact' : 'Offline'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Community Posts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Discussions</Text>
          
          {posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.postAuthor}>
                  <User size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.authorName}>
                    {post.isAnonymous ? 'Anonymous Student' : 'Student'}
                  </Text>
                </View>
                <Text style={styles.postTime}>{post.timestamp}</Text>
              </View>
              
              {post.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{post.category}</Text>
                </View>
              )}
              
              <Text style={styles.postContent}>{post.content}</Text>
              
              {post.responses.length > 0 && (
                <View style={styles.responsesContainer}>
                  <Text style={styles.responsesTitle}>
                    {post.responses.length} Response{post.responses.length > 1 ? 's' : ''}
                  </Text>
                  
                  {post.responses.map((response) => (
                    <View key={response.id} style={styles.responseCard}>
                      <View style={styles.responseHeader}>
                        <View style={styles.responseAuthor}>
                          <User size={14} color={getRoleColor(response.authorRole)} />
                          <Text style={[styles.responseAuthorName, { color: getRoleColor(response.authorRole) }]}>
                            {response.authorName}
                          </Text>
                          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(response.authorRole) }]}>
                            <Text style={styles.roleBadgeText}>{getRoleBadge(response.authorRole)}</Text>
                          </View>
                        </View>
                        <Text style={styles.responseTime}>{response.timestamp}</Text>
                      </View>
                      <Text style={styles.responseContent}>{response.content}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.postActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Heart size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.actionText}>Helpful</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <MessageCircle size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.actionText}>Reply</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* New Post Modal */}
      <Modal
        visible={showNewPostModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Share with Community</Text>
            <TouchableOpacity onPress={() => setShowNewPostModal(false)} style={styles.closeButton}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Your Question or Message</Text>
            <TextInput
              style={styles.textInput}
              value={newPostContent}
              onChangeText={setNewPostContent}
              placeholder="Share what's on your mind, ask for advice, or offer support to others..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            
            <View style={styles.anonymousToggle}>
              <TouchableOpacity 
                style={styles.toggleButton}
                onPress={() => setIsAnonymous(!isAnonymous)}
              >
                <View style={[styles.checkbox, isAnonymous && styles.checkboxChecked]}>
                  {isAnonymous && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.toggleText}>Post anonymously</Text>
              </TouchableOpacity>
              <Text style={styles.toggleDescription}>
                Your identity will be hidden from other community members
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleCreatePost}
            >
              <Send size={20} color={theme.colors.surface} />
              <Text style={styles.submitButtonText}>Share with Community</Text>
            </TouchableOpacity>
          </View>
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
  addButton: {
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
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  volunteersScroll: {
    paddingLeft: theme.spacing.lg,
  },
  volunteerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginRight: theme.spacing.md,
    width: 140,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  volunteerOffline: {
    opacity: 0.6,
  },
  volunteerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.calm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  volunteerName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  volunteerSpecialty: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  contactButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  contactButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  contactButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.surface,
  },
  contactButtonTextDisabled: {
    color: theme.colors.textSecondary,
  },
  postCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  postTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  categoryBadge: {
    backgroundColor: theme.colors.accent + '30',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
  },
  postContent: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
  },
  responsesContainer: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  responsesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  responseCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  responseAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flex: 1,
  },
  responseAuthorName: {
    fontSize: 14,
    fontWeight: '500',
  },
  roleBadge: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.xs,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: theme.colors.surface,
  },
  responseTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  responseContent: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  postActions: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  actionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
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
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    height: 120,
    marginBottom: theme.spacing.lg,
  },
  anonymousToggle: {
    marginBottom: theme.spacing.xl,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: theme.colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  toggleText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  toggleDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 32,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
});