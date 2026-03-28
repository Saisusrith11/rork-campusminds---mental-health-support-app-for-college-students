import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ColorValue } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Bot, 
  Calendar, 
  ClipboardList, 
  Activity, 
  BookOpen, 
  Users, 
  User,
  Heart,
  Brain,
  Shield
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/auth-store';
import { router } from 'expo-router';
import CounselorHomeScreen from '@/components/CounselorHomeScreen';
import AdminHomeScreen from '@/components/AdminHomeScreen';
import VolunteerHomeScreen from '@/components/VolunteerHomeScreen';

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onPress: () => void;
  gradient: readonly [ColorValue, ColorValue, ...ColorValue[]];
  testID?: string;
}

function ToolCard({ title, description, icon, onPress, gradient, testID }: ToolCardProps) {
  return (
    <TouchableOpacity style={styles.toolCard} onPress={onPress} testID={testID}>
      <LinearGradient colors={gradient} style={styles.toolGradient}>
        <View style={styles.toolIcon}>
          {icon}
        </View>
        <View style={styles.toolContent}>
          <Text style={styles.toolTitle}>{title}</Text>
          <Text style={styles.toolDescription}>{description}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();

  // Show role-specific home screens
  if (user?.role === 'counselor') {
    return <CounselorHomeScreen />;
  }

  if (user?.role === 'admin') {
    return <AdminHomeScreen />;
  }

  if (user?.role === 'volunteer') {
    return <VolunteerHomeScreen />;
  }

  // Default to student interface
  const studentTools = [
    {
      title: 'MindCare AI Assistant',
      description: 'Get immediate mental health support and personalized activities',
      icon: <Bot size={28} color={theme.colors.surface} />,
      gradient: [theme.colors.primary, theme.colors.secondary] as const,
      onPress: () => router.push('/ai-chat'),
      testID: 'ai-chat-tool'
    },
    {
      title: 'Book Counselor Session',
      description: 'Schedule appointments with professional counselors',
      icon: <Calendar size={28} color={theme.colors.surface} />,
      gradient: [theme.colors.focus, theme.colors.calm] as const,
      onPress: () => router.push('/book-session'),
      testID: 'book-session-tool'
    },
    {
      title: 'Mental Health Assessment',
      description: 'Complete a 15-question screening for personalized insights',
      icon: <ClipboardList size={28} color={theme.colors.surface} />,
      gradient: [theme.colors.warning, theme.colors.energy] as const,
      onPress: () => router.push('/assessment'),
      testID: 'assessment-tool'
    },
    {
      title: 'Wellness Activities',
      description: 'Interactive self-help exercises and mindfulness practices',
      icon: <Activity size={28} color={theme.colors.surface} />,
      gradient: [theme.colors.success, theme.colors.calm] as const,
      onPress: () => router.push('/wellness-activities'),
      testID: 'wellness-activities-tool'
    },
    {
      title: 'Resources Library',
      description: 'Educational content, articles, and multimedia resources',
      icon: <BookOpen size={28} color={theme.colors.surface} />,
      gradient: [theme.colors.primaryDark, theme.colors.focus] as const,
      onPress: () => router.push('/(tabs)/resources'),
      testID: 'resources-tool'
    },
    {
      title: 'Community Support',
      description: 'Connect with volunteers and join support discussions',
      icon: <Users size={28} color={theme.colors.surface} />,
      gradient: [theme.colors.accent, theme.colors.warning] as const,
      onPress: () => router.push('/community'),
      testID: 'community-tool'
    },
    {
      title: 'My Profile',
      description: 'Manage your account, view progress, and track wellness',
      icon: <User size={28} color={theme.colors.surface} />,
      gradient: [theme.colors.textSecondary, theme.colors.textLight] as const,
      onPress: () => router.push('/(tabs)/profile'),
      testID: 'profile-tool'
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getRiskLevelInfo = () => {
    const riskLevel = user?.riskLevel || 'minimal';
    const lastScore = user?.lastAssessmentScore || 0;
    
    switch (riskLevel) {
      case 'minimal':
        return {
          icon: <Shield size={20} color={theme.colors.success} />,
          text: 'Wellness Status: Good',
          color: theme.colors.success,
          message: 'Keep up the great work with your mental health!'
        };
      case 'moderate':
        return {
          icon: <Heart size={20} color={theme.colors.warning} />,
          text: 'Wellness Status: Moderate',
          color: theme.colors.warning,
          message: 'Consider exploring our wellness activities and resources.'
        };
      case 'high':
        return {
          icon: <Brain size={20} color={theme.colors.error} />,
          text: 'Wellness Status: Needs Attention',
          color: theme.colors.error,
          message: 'We recommend speaking with a professional counselor.'
        };
      default:
        return {
          icon: <Heart size={20} color={theme.colors.primary} />,
          text: 'Take Assessment',
          color: theme.colors.primary,
          message: 'Complete your mental health assessment to get started.'
        };
    }
  };

  const riskInfo = getRiskLevelInfo();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.name || 'Student'}</Text>
            <Text style={styles.subtitle}>How can we support your wellness today?</Text>
          </View>
          
          {/* Wellness Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              {riskInfo.icon}
              <Text style={[styles.statusText, { color: riskInfo.color }]}>
                {riskInfo.text}
              </Text>
            </View>
            <Text style={styles.statusMessage}>{riskInfo.message}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Mental Health Tools</Text>
          <Text style={styles.sectionSubtitle}>
            Seven comprehensive tools designed to support your mental wellness journey
          </Text>
        </View>

        {/* Tools Grid */}
        <View style={styles.toolsContainer}>
          {studentTools.map((tool, index) => (
            <ToolCard
              key={index}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              onPress={tool.onPress}
              gradient={tool.gradient}
              testID={tool.testID}
            />
          ))}
        </View>

        {/* Emergency Support */}
        <View style={styles.emergencySection}>
          <View style={styles.emergencyCard}>
            <Text style={styles.emergencyTitle}>Need Immediate Help?</Text>
            <Text style={styles.emergencyText}>
              If you're in crisis or having thoughts of self-harm, please reach out immediately:
            </Text>
            <TouchableOpacity 
              style={styles.emergencyButton}
              onPress={() => router.push('/emergency-contacts')}
              testID="emergency-contacts"
            >
              <Text style={styles.emergencyButtonText}>Emergency Contacts</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  welcomeSection: {
    marginBottom: theme.spacing.xl,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
  },
  userName: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  statusCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  toolsContainer: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  toolCard: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toolGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  toolIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolContent: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.surface,
    marginBottom: theme.spacing.xs,
  },
  toolDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  emergencySection: {
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xxl,
  },
  emergencyCard: {
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.surface,
    marginBottom: theme.spacing.sm,
  },
  emergencyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  emergencyButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.error,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});