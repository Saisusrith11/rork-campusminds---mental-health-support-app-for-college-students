import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Send, Bot, User, ArrowLeft } from 'lucide-react-native';
import { theme } from '@/constants/theme';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  options?: ChatOption[];
}

interface ChatOption {
  id: string;
  text: string;
  value: string;
}

interface ConversationState {
  step: string;
  condition?: string;
  attemptLevel: number;
  progressStep: number;
}

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome to *MindCare* – Your Compassionate Mental Health Companion.\n\nI\'m here to support you gently through whatever you\'re experiencing with personalized guidance and activities designed just for you.\n\nThis is a safe, non-judgmental space where you can share your feelings freely and receive caring, immediate help tailored to your needs.',
      isUser: false,
      timestamp: new Date()
    },
    {
      id: '2',
      text: 'Hi there! I\'m here to listen and support you. To understand how best to help, could you please share what you\'re experiencing right now?',
      isUser: false,
      timestamp: new Date(),
      options: [
        { id: '1', text: 'Stress', value: 'stress' },
        { id: '2', text: 'Anxiety', value: 'anxiety' },
        { id: '3', text: 'Depression', value: 'depression' },
        { id: '4', text: 'Sleep Issues', value: 'sleep' },
        { id: '5', text: 'Emergency', value: 'emergency' }
      ]
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [conversationState, setConversationState] = useState<ConversationState>({
    step: 'initial',
    attemptLevel: 0,
    progressStep: 1
  });
  const scrollViewRef = useRef<ScrollView>(null);

  const getProgressText = (step: number) => {
    const progressTexts = [
      'Step 1 of 4: Initial Assessment',
      'Step 2 of 4: First Intervention',
      'Step 3 of 4: Status Check',
      'Step 4 of 4: Next Steps'
    ];
    return progressTexts[step - 1] || '';
  };

  const addMessage = (text: string, isUser: boolean, options?: ChatOption[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
      options
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleOptionSelect = (option: ChatOption) => {
    addMessage(option.text, true);
    
    setTimeout(() => {
      handleAIResponse(option.value);
    }, 1000);
  };

  const handleAIResponse = (selectedOption: string) => {
    let response = '';
    let options: ChatOption[] | undefined;
    let newState = { ...conversationState };
    
    switch (selectedOption) {
      case 'emergency':
        response = 'I\'m truly sorry you\'re going through this difficult moment. Your safety is the most important thing right now, and immediate help is available. You don\'t have to face this alone.\n\n🚨 **What you can do immediately:**\n• Contact a mental health professional or counselor right away\n• Reach out to your campus counseling center\n• Call a crisis helpline if you\'re in urgent danger\n\n📞 **Emergency Resources:**\n• NIMHANS Helpline: 1800-599-0019 (24x7)\n• iCall (TISS): +91 9152987821 (24x7)\n• National Suicide Prevention Lifeline: 988\n• Crisis Text Line: Text HOME to 741741\n\nPlease reach out for help — you matter deeply, and there are caring people ready to support you.';
        options = [
          { id: 'contact', text: 'Contact Counselor', value: 'contact_counselor' },
          { id: 'resources', text: 'Get Help Resources', value: 'help_resources' }
        ];
        newState = { step: 'emergency', progressStep: 4, attemptLevel: 0 };
        break;
        
      case 'stress':
        response = 'I hear you\'re feeling stressed. Let\'s try a quick, calming exercise to ease your mind and body.\n\n🌱 **5-Minute Deep Breathing Exercise:**\n• Sit comfortably and close your eyes\n• Breathe in through your nose for 4 seconds\n• Hold that breath gently for 4 seconds\n• Slowly exhale through your mouth for 6 seconds\n• Repeat for 5 minutes, focusing only on your breath, letting other thoughts drift away\n\nThis helps activate your relaxation response and reduce stress quickly.';
        options = [
          { id: 'tried', text: 'I tried it - it helped!', value: 'stress_helped' },
          { id: 'need_more', text: 'I need more help', value: 'stress_more' }
        ];
        newState = { step: 'stress_low', condition: 'stress', progressStep: 2, attemptLevel: 1 };
        break;
        
      case 'anxiety':
        response = 'Feeling anxious? This grounding exercise will help you reconnect with the present moment.\n\n🌟 **5-4-3-2-1 Grounding Technique:**\n• Name 5 things you see around you\n• Identify 4 things you can hear\n• Notice 3 things you can feel through touch\n• Detect 2 scents you can smell\n• Recall 1 thing you can taste\n\nThis shifts your focus away from worries and into now, calming anxious thoughts.';
        options = [
          { id: 'tried', text: 'I tried it - it helped!', value: 'anxiety_helped' },
          { id: 'need_more', text: 'I need more help', value: 'anxiety_more' }
        ];
        newState = { step: 'anxiety_low', condition: 'anxiety', progressStep: 2, attemptLevel: 1 };
        break;
        
      case 'depression':
        response = 'I know depression can feel heavy. Let\'s try a small heartfelt practice to brighten your mood just a little.\n\n💝 **Gratitude Reflection:**\n• Think about your day, no matter how small\n• List 3 things you\'re grateful for — a warm cup of coffee, a kind message, a safe place\n• Focus on each and how it made you feel\n\nThis gently redirects your brain to positive moments, even in hard times.';
        options = [
          { id: 'tried', text: 'I tried it - it helped!', value: 'depression_helped' },
          { id: 'need_more', text: 'I need more help', value: 'depression_more' }
        ];
        newState = { step: 'depression_low', condition: 'depression', progressStep: 2, attemptLevel: 1 };
        break;
        
      case 'sleep':
        response = 'Trouble sleeping? Here\'s a simple routine to signal your brain it\'s time to rest.\n\n🌙 **Digital Sunset:**\n• Turn off all screens 30 minutes before bed\n• Dim the lights in your room\n• Engage in calming activities like reading or light stretching\n• Keep your room cool and comfortable\n• Avoid caffeine 4-6 hours before sleep\n\nThis helps your brain produce melatonin naturally for better rest.';
        options = [
          { id: 'tried', text: 'I tried it - it helped!', value: 'sleep_helped' },
          { id: 'need_more', text: 'I need more help', value: 'sleep_more' }
        ];
        newState = { step: 'sleep_low', condition: 'sleep', progressStep: 2, attemptLevel: 1 };
        break;
        
      // Success responses
      case 'stress_helped':
      case 'anxiety_helped':
      case 'depression_helped':
      case 'sleep_helped':
        response = 'That\'s wonderful news! I\'m really glad that helped. Remember, small steps lead to big improvements over time.\n\n✨ Keep in mind:\n• Practice regularly for best results\n• It\'s normal to have ups and downs\n• You\'re showing great courage seeking support and trying new things\n• I\'m always here whenever you need me\n\nTake good care—prioritizing your mental health is a powerful act of self-care. You\'ve got this! 💪';
        options = [
          { id: 'restart', text: 'Start New Conversation', value: 'restart' }
        ];
        newState = { step: 'success', progressStep: 4, attemptLevel: 0 };
        break;
        
      // Advanced interventions
      case 'stress_more':
        response = 'Since the first technique wasn\'t enough, let\'s try something more comprehensive.\n\n🧘 **Progressive Muscle Relaxation:**\n• Lie down in a quiet space\n• Tense each muscle group (starting from your toes) for 5 seconds, then release slowly\n• Move progressively upward (calves, thighs, abdomen, etc.)\n• Notice the tension-to-relaxation contrast\n• Breathe deeply throughout (15-20 minutes total)\n\n**Bonus tips:** Write down stresses, break problems into steps, talk to someone trusted, look after sleep and nutrition.';
        options = [
          { id: 'better', text: 'Yes, I feel much better', value: 'stress_advanced_helped' },
          { id: 'professional', text: 'No, I still need professional help', value: 'need_professional' }
        ];
        newState = { step: 'stress_high', condition: 'stress', progressStep: 3, attemptLevel: 2 };
        break;
        
      case 'anxiety_more':
        response = 'Try this calming meditation to reduce anxiety.\n\n🧠 **Mindfulness Meditation (10 min):**\n• Sit comfortably, eyes closed\n• Focus on your natural breath\n• When anxious thoughts come, notice them without judgment e.g., "I\'m having an anxious thought"\n• Gently bring attention back to your breath\n• It\'s okay if your mind wanders—just guide it back\n\n**Also consider:** challenging negative thoughts, practicing self-kindness, limiting caffeine/alcohol, and journaling triggers.';
        options = [
          { id: 'better', text: 'Yes, I feel much better', value: 'anxiety_advanced_helped' },
          { id: 'professional', text: 'No, I still need professional help', value: 'need_professional' }
        ];
        newState = { step: 'anxiety_high', condition: 'anxiety', progressStep: 3, attemptLevel: 2 };
        break;
        
      case 'depression_more':
        response = 'A structured way to process feelings and plan positive steps.\n\n📝 **Emotional Journaling (15 min):**\n• Find a quiet spot\n• Write honestly about your current feelings\n• Reflect on triggers and recurring thoughts\n• Plan one small self-care action today\n• End with something you look forward to, however small\n\n**Additional support:** Keep basic routines, reach out to trusted people, move gently (walks), and remember negative thoughts aren\'t facts.';
        options = [
          { id: 'better', text: 'Yes, I feel much better', value: 'depression_advanced_helped' },
          { id: 'professional', text: 'No, I still need professional help', value: 'need_professional' }
        ];
        newState = { step: 'depression_high', condition: 'depression', progressStep: 3, attemptLevel: 2 };
        break;
        
      case 'sleep_more':
        response = 'A full sleep improvement plan.\n\n📋 **Sleep Hygiene Routine:**\n• Keep consistent sleep/wake times\n• Follow pre-sleep rituals: dim lights, no screens, calm activities\n• Optimize bedroom: cool, dark, quiet\n• If unable to sleep after 20 mins, get up and do something quiet\n• Avoid large meals, alcohol, exercise 3 hours before bed\n• Morning sunlight exposure helps regulate rhythm\n\nTrack your sleep in a journal to find helpful patterns.';
        options = [
          { id: 'better', text: 'Yes, I feel much better', value: 'sleep_advanced_helped' },
          { id: 'professional', text: 'No, I still need professional help', value: 'need_professional' }
        ];
        newState = { step: 'sleep_high', condition: 'sleep', progressStep: 3, attemptLevel: 2 };
        break;
        
      // Advanced success responses
      case 'stress_advanced_helped':
      case 'anxiety_advanced_helped':
      case 'depression_advanced_helped':
      case 'sleep_advanced_helped':
        response = 'That\'s wonderful news! I\'m really glad that helped. Remember, small steps lead to big improvements over time.\n\n✨ Keep in mind:\n• Practice regularly for best results\n• It\'s normal to have ups and downs\n• You\'re showing great courage seeking support and trying new things\n• I\'m always here whenever you need me\n\nTake good care—prioritizing your mental health is a powerful act of self-care. You\'ve got this! 💪';
        options = [
          { id: 'restart', text: 'Start New Conversation', value: 'restart' }
        ];
        newState = { step: 'success', progressStep: 4, attemptLevel: 0 };
        break;
        
      case 'need_professional':
        response = 'I\'m proud of you for recognizing when additional support is needed. Seeking professional help is a strong and positive step.\n\n🤝 **Next Steps:**\n• Campus Counseling Center: Free student support\n• Licensed Therapists: Consider booking sessions\n• Support Groups: Peer support locally or online\n• Trusted Adults: Professors, advisors, family members\n\n📞 **Helpful Contacts:**\n• NIMHANS Helpline: 1800-599-0019 (24x7)\n• iCall (TISS): +91 9152987821 (24x7)\n• Crisis Text Line: Text HOME to 741741\n• Your Student Health Services\n\nYou deserve compassionate care and assistance—you don\'t have to face this alone.';
        options = [
          { id: 'find_counselor', text: 'Find Counselor', value: 'find_counselor' },
          { id: 'get_resources', text: 'Get Resources', value: 'get_resources' }
        ];
        newState = { step: 'professional_help', progressStep: 4, attemptLevel: 0 };
        break;
        
      case 'restart':
        restartConversation();
        return;
        
      default:
        response = 'Thank you for sharing. I\'m here to support you through whatever you\'re experiencing. How would you like to proceed?';
    }
    
    setConversationState(newState);
    addMessage(response, false, options);
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      addMessage(inputText, true);
      setInputText('');
      
      // Simple AI response for free text
      setTimeout(() => {
        addMessage('Thank you for sharing that with me. I\'m here to listen and support you. Based on what you\'ve told me, would you like to try one of our guided activities, or would you prefer to continue talking about how you\'re feeling?', false);
      }, 1000);
    }
  };

  const restartConversation = () => {
    setMessages([
      {
        id: '1',
        text: 'Welcome back to MindCare. I\'m here to support you. What would you like to focus on today?',
        isUser: false,
        timestamp: new Date(),
        options: [
          { id: '1', text: 'Stress', value: 'stress' },
          { id: '2', text: 'Anxiety', value: 'anxiety' },
          { id: '3', text: 'Depression', value: 'depression' },
          { id: '4', text: 'Sleep Issues', value: 'sleep' },
          { id: '5', text: 'Emergency', value: 'emergency' }
        ]
      }
    ]);
    setConversationState({
      step: 'initial',
      attemptLevel: 0,
      progressStep: 1
    });
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'MindCare AI Assistant',
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
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <View key={message.id} style={[
              styles.messageContainer,
              message.isUser ? styles.userMessage : styles.aiMessage
            ]}>
              <View style={styles.messageHeader}>
                {message.isUser ? (
                  <User size={16} color={theme.colors.primary} />
                ) : (
                  <Bot size={16} color={theme.colors.secondary} />
                )}
                <Text style={styles.messageRole}>
                  {message.isUser ? 'You' : 'MindCare'}
                </Text>
              </View>
              <Text style={[
                styles.messageText,
                message.isUser ? styles.userMessageText : styles.aiMessageText
              ]}>
                {message.text}
              </Text>
            </View>
          ))}
          
          {messages.map((message, index) => (
            <View key={`${message.id}-options`}>
              {message.options && index === messages.length - 1 && (
                <View style={styles.optionsContainer}>
                  <Text style={styles.optionsTitle}>
                    {conversationState.step === 'initial' ? 'How are you feeling today?' : 'What would you like to do?'}
                  </Text>
                  {message.options.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.optionButton}
                      onPress={() => handleOptionSelect(option)}
                    >
                      <Text style={styles.optionText}>{option.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
          
          {conversationState.progressStep > 1 && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {getProgressText(conversationState.progressStep)}
              </Text>
            </View>
          )}
        </ScrollView>
        
        <View style={styles.inputContainer}>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={restartConversation}
            >
              <Text style={styles.actionButtonText}>Restart</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                Alert.alert(
                  'Emergency Resources',
                  '🚨 NIMHANS Helpline: 1800-599-0019 (24x7)\n🚨 iCall (TISS): +91 9152987821 (24x7)\n🚨 Crisis Text Line: Text HOME to 741741\n\nFor more resources, visit the Resources tab.',
                  [{ text: 'OK' }]
                );
              }}
            >
              <Text style={styles.actionButtonText}>Emergency Help</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.messageInputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message here..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
            >
              <Send size={20} color={inputText.trim() ? theme.colors.surface : theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  messageContainer: {
    marginBottom: theme.spacing.md,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  messageRole: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: theme.colors.surface,
  },
  aiMessageText: {
    color: theme.colors.text,
  },
  optionsContainer: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  optionText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  actionButtonText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '500',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'center',
  },
});