import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/auth-store';
import { useNotifications } from '@/hooks/notification-store';
import { useOffline } from '@/hooks/offline-store';
import { getDemoUser, getDemoNotifications, getDemoOfflineData } from '@/data/demo-users';
import type { User } from '@/types/user';

export default function LoginScreen() {
  const { login, loginWithUserData } = useAuth();
  const { addNotification } = useNotifications();
  const { cacheAssessment, cacheResource, cacheActivity } = useOffline();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      console.log('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    try {
      // Try API login first
      const result = await login({ username: username.toLowerCase(), password });
      
      if (result.success && result.user) {
        console.log(`Successfully logged in as ${result.user.role}: ${result.user.name}`);
        router.replace('/(tabs)/home');
      } else {
        // Fallback to demo data if API is not available
        console.log('API login failed, trying demo data:', result.error);
        
        const demoUser = getDemoUser(username.toLowerCase(), password);
        
        if (demoUser) {
          // Convert demo user to app user format
          const user: User = {
            id: demoUser.id,
            username: demoUser.username,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
            college: demoUser.college || 'CampusMinds University',
            isOnboarded: true,
            createdAt: new Date().toISOString(),
            // Role-specific fields
            ...(demoUser.role === 'student' && {
              studentId: `STU${demoUser.id.slice(-3).padStart(3, '0')}`,
              year: '3rd Year',
              department: 'Computer Science',
              emergencyContact: '+91-9876543210',
            }),
            ...(demoUser.role === 'counselor' && {
              licenseNumber: `PSY-2024-${demoUser.id.slice(-3)}`,
              specializations: [demoUser.specialization || 'General Counseling'],
              experience: demoUser.experience || '5',
              qualifications: 'Licensed Mental Health Professional',
              languages: demoUser.languages,
              verified: demoUser.verified,
            }),
            ...(demoUser.role === 'volunteer' && {
              volunteerType: demoUser.specialization || 'Peer Support',
              availability: 'Weekdays 6-9 PM',
              trainingCompleted: demoUser.verified,
              languages: demoUser.languages,
            }),
            ...(demoUser.role === 'admin' && {
              adminLevel: 'super',
              permissions: ['all'],
            }),
          };

          // Login user with demo data
          await loginWithUserData(user);

          // Load demo notifications for the user role
          const notifications = getDemoNotifications(demoUser.role);
          for (const notif of notifications) {
            await addNotification({
              id: notif.id,
              title: notif.title,
              body: notif.body,
              data: {},
              timestamp: notif.timestamp,
              read: notif.read,
              type: notif.type as 'appointment' | 'message' | 'assessment' | 'emergency' | 'system',
              priority: notif.priority as 'low' | 'normal' | 'high' | 'urgent',
              userRole: demoUser.role,
            });
          }

          // Load demo offline data
          const offlineData = getDemoOfflineData(demoUser.role) as any;
          if (offlineData?.assessments) {
            for (const assessment of offlineData.assessments) {
              await cacheAssessment(assessment);
            }
          }
          if (offlineData?.resources) {
            for (const resource of offlineData.resources) {
              await cacheResource(resource);
            }
          }
          if (offlineData?.activities) {
            for (const activity of offlineData.activities) {
              await cacheActivity(activity);
            }
          }

          console.log(`Successfully logged in with demo data as ${demoUser.role}: ${demoUser.name}`);
          router.replace('/(tabs)/home');
        } else {
          console.log('Invalid credentials. Check the demo credentials below.');
        }
      }
    } catch (error) {
      console.log('Failed to sign in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        testID="back-button"
      >
        <ArrowLeft size={24} color={theme.colors.text} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your wellness journey</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.demoCredentials}>
            <Text style={styles.demoTitle}>Demo Credentials (All passwords: demo123):</Text>
            <Text style={styles.demoSection}>Students:</Text>
            <Text style={styles.demoText}>• <Text style={styles.bold}>student1</Text> - Arjun Kumar (Delhi University)</Text>
            <Text style={styles.demoText}>• <Text style={styles.bold}>student2</Text> - Priya Sharma (Mumbai University)</Text>
            <Text style={styles.demoText}>• <Text style={styles.bold}>student3</Text> - Rahul Singh (Bangalore University)</Text>
            
            <Text style={styles.demoSection}>Counselors:</Text>
            <Text style={styles.demoText}>• <Text style={styles.bold}>counselor1</Text> - Dr. Meera Patel (Clinical Psychology)</Text>
            <Text style={styles.demoText}>• <Text style={styles.bold}>counselor2</Text> - Dr. Rajesh Gupta (Anxiety & Depression)</Text>
            <Text style={styles.demoText}>• <Text style={styles.bold}>counselor3</Text> - Dr. Anita Reddy (Student Counseling)</Text>
            
            <Text style={styles.demoSection}>Volunteers:</Text>
            <Text style={styles.demoText}>• <Text style={styles.bold}>volunteer1</Text> - Kavya Nair (Peer Support)</Text>
            <Text style={styles.demoText}>• <Text style={styles.bold}>volunteer2</Text> - Amit Joshi (Crisis Support)</Text>
            <Text style={styles.demoText}>• <Text style={styles.bold}>volunteer3</Text> - Sneha Das (Academic Stress)</Text>
            
            <Text style={styles.demoSection}>Admins:</Text>
            <Text style={styles.demoText}>• <Text style={styles.bold}>admin1</Text> - Dr. Vikram Agarwal (System Admin)</Text>
            <Text style={styles.demoText}>• <Text style={styles.bold}>admin2</Text> - Sunita Mehta (Platform Manager)</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              autoCapitalize="none"
              testID="username-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              testID="password-input"
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
            testID="login-button"
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => router.push('/(auth)/register')}
            testID="register-link"
          >
            <Text style={styles.registerLinkText}>
              Don&apos;t have an account? <Text style={styles.linkText}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
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
    paddingHorizontal: theme.spacing.xl,
  },
  backButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: theme.spacing.lg,
  },
  inputGroup: {
    gap: theme.spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    backgroundColor: theme.colors.surface,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  registerLinkText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  linkText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
  },
  demoCredentials: {
    backgroundColor: theme.colors.calm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  demoSection: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
    marginBottom: 4,
  },
  demoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
    color: theme.colors.text,
  },
});