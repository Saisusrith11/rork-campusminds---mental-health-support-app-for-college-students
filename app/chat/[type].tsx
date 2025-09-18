import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Send, 
  User, 
  Shield,
  AlertTriangle,
  Phone,
  Video,
  MoreVertical
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';
import type { ChatMessage } from '@/types/user';

// Mock chat data
const mockMessages: ChatMessage[] = [
  {
    id: '1',
    content: 'Hello! I\'m here to support you. How are you feeling today?',
    sender: 'volunteer',
    timestamp: '2024-01-15T10:00:00Z',
    type: 'text',
    isEncrypted: true
  },
  {
    id: '2',
    content: 'Hi, thank you for reaching out. I\'ve been feeling quite anxious lately about my upcoming exams.',
    sender: 'user',
    timestamp: '2024-01-15T10:02:00Z',
    type: 'text',
    isEncrypted: true
  },
  {
    id: '3',
    content: 'I understand that exam anxiety can be really overwhelming. It\'s completely normal to feel this way. Can you tell me more about what specifically is making you feel anxious?',
    sender: 'volunteer',
    timestamp: '2024-01-15T10:05:00Z',
    type: 'text',
    isEncrypted: true
  },
  {
    id: '4',
    content: 'I keep worrying that I won\'t remember everything I\'ve studied. Sometimes I feel like my mind goes blank when I think about the exam.',
    sender: 'user',
    timestamp: '2024-01-15T10:08:00Z',
    type: 'text',
    isEncrypted: true
  },
  {
    id: '5',
    content: 'That sounds really stressful. Have you tried any relaxation techniques before? Sometimes deep breathing exercises can help calm the mind before studying or during exams.',
    sender: 'volunteer',
    timestamp: '2024-01-15T10:12:00Z',
    type: 'text',
    isEncrypted: true
  }
];

const volunteerInfo = {
  id: 'volunteer-1',
  name: 'Alex Thompson',
  role: 'Peer Support Volunteer',
  specialties: ['Academic Stress', 'Social Anxiety'],
  isOnline: true,
  languages: ['English', 'Hindi']
};

const counselorInfo = {
  id: 'counselor-1',
  name: 'Dr. Sarah Johnson',
  role: 'Licensed Counselor',
  specialties: ['Anxiety', 'Depression', 'Academic Stress'],
  isOnline: true,
  languages: ['English', 'Tamil']
};

export default function ChatScreen() {
  const { type, userId } = useLocalSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const isCounselorChat = type === 'counselor';
  const chatPartner = isCounselorChat ? counselorInfo : volunteerInfo;

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputText.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'text',
      isEncrypted: true
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate typing indicator and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      // Simulate AI flagging for harmful content
      const harmfulKeywords = ['suicide', 'kill myself', 'end it all', 'hurt myself'];
      const isHarmful = harmfulKeywords.some(keyword => 
        inputText.toLowerCase().includes(keyword)
      );

      if (isHarmful) {
        const emergencyResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: '🚨 I\'m concerned about your safety. Please reach out to emergency services immediately:\n\n• NIMHANS Helpline: 1800-599-0019 (24x7)\n• iCall (TISS): +91 9152987821 (24x7)\n\nYou are not alone, and help is available. Would you like me to connect you with a counselor right now?',
          sender: isCounselorChat ? 'counselor' : 'volunteer',
          timestamp: new Date().toISOString(),
          type: 'text',
          isEncrypted: true
        };
        setMessages(prev => [...prev, emergencyResponse]);
      } else {
        // Normal supportive response
        const responses = [
          'Thank you for sharing that with me. How does that make you feel?',
          'I hear you. That sounds challenging. What support do you think would help you most right now?',
          'It takes courage to talk about these feelings. What has helped you cope in similar situations before?',
          'I appreciate you opening up. Would you like to explore some coping strategies together?'
        ];
        
        const response: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: responses[Math.floor(Math.random() * responses.length)],
          sender: isCounselorChat ? 'counselor' : 'volunteer',
          timestamp: new Date().toISOString(),
          type: 'text',
          isEncrypted: true
        };
        setMessages(prev => [...prev, response]);
      }
    }, 2000);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.sender === 'user';
    const isEmergency = message.content.includes('🚨');

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.partnerMessage,
          isEmergency && styles.emergencyMessage
        ]}
      >
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.partnerBubble,
          isEmergency && styles.emergencyBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.partnerMessageText,
            isEmergency && styles.emergencyMessageText
          ]}>
            {message.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isUser ? styles.userMessageTime : styles.partnerMessageTime
          ]}>
            {formatTime(message.timestamp)}
            {message.isEncrypted && ' 🔒'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <View style={styles.avatarContainer}>
            <User size={20} color={theme.colors.primary} />
            {chatPartner.isOnline && <View style={styles.onlineIndicator} />}
          </View>
          
          <View style={styles.headerText}>
            <Text style={styles.headerName}>{chatPartner.name}</Text>
            <Text style={styles.headerRole}>
              {chatPartner.role} • {chatPartner.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {isCounselorChat && (
            <>
              <TouchableOpacity style={styles.actionButton}>
                <Phone size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Video size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.actionButton}>
            <MoreVertical size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Safety Notice */}
      <View style={styles.safetyNotice}>
        <Shield size={16} color={theme.colors.primary} />
        <Text style={styles.safetyText}>
          End-to-end encrypted • Confidential support
        </Text>
      </View>

      {/* Emergency Banner */}
      <View style={styles.emergencyBanner}>
        <AlertTriangle size={16} color={theme.colors.error} />
        <Text style={styles.emergencyText}>
          Crisis? Call NIMHANS: 1800-599-0019 or iCall: +91 9152987821
        </Text>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(renderMessage)}
          
          {isTyping && (
            <View style={[styles.messageContainer, styles.partnerMessage]}>
              <View style={[styles.messageBubble, styles.partnerBubble, styles.typingBubble]}>
                <Text style={styles.typingText}>
                  {chatPartner.name.split(' ')[0]} is typing...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Send size={20} color={theme.colors.surface} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Chat Info */}
      <View style={styles.chatInfo}>
        <Text style={styles.chatInfoText}>
          Specialties: {chatPartner.specialties.join(', ')} • 
          Languages: {chatPartner.languages.join(', ')}
        </Text>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  headerRole: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.sm,
  },
  safetyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '10',
  },
  safetyText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.error + '10',
  },
  emergencyText: {
    fontSize: 11,
    color: theme.colors.error,
    fontWeight: '500',
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  messageContainer: {
    marginBottom: theme.spacing.md,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  partnerMessage: {
    alignItems: 'flex-start',
  },
  emergencyMessage: {
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: theme.borderRadius.sm,
  },
  partnerBubble: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emergencyBubble: {
    backgroundColor: theme.colors.error + '10',
    borderColor: theme.colors.error,
    borderWidth: 1,
    maxWidth: '90%',
  },
  typingBubble: {
    backgroundColor: theme.colors.border,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: theme.colors.surface,
  },
  partnerMessageText: {
    color: theme.colors.text,
  },
  emergencyMessageText: {
    color: theme.colors.error,
    fontWeight: '500',
  },
  messageTime: {
    fontSize: 11,
    marginTop: theme.spacing.xs,
  },
  userMessageTime: {
    color: theme.colors.surface + 'CC',
    textAlign: 'right',
  },
  partnerMessageTime: {
    color: theme.colors.textSecondary,
  },
  typingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  chatInfo: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  chatInfoText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});