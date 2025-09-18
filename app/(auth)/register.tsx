import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/auth-store';
import type { User } from '@/types/user';

export default function RegisterScreen() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    college: '',
    role: 'student' as User['role'],
    // Student specific
    studentId: '',
    year: '',
    department: '',
    emergencyContact: '',
    // Counselor specific
    licenseNumber: '',
    specializations: '',
    experience: '',
    qualifications: '',
    // Volunteer specific
    volunteerType: '',
    availability: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    const requiredFields = ['username', 'password', 'confirmPassword', 'name', 'email', 'college'];
    const roleSpecificFields = {
      student: ['studentId', 'year', 'department'],
      counselor: ['licenseNumber', 'specializations', 'experience'],
      volunteer: ['volunteerType', 'availability'],
      admin: []
    };

    const allRequiredFields = [...requiredFields, ...roleSpecificFields[formData.role]];
    const missingFields = allRequiredFields.filter(field => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      console.log('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      console.log('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const newUser: User = {
        id: Date.now().toString(),
        username: formData.username,
        email: formData.email,
        name: formData.name,
        role: formData.role,
        college: formData.college,
        isOnboarded: false,
        createdAt: new Date().toISOString(),
        // Student fields
        ...(formData.role === 'student' && {
          studentId: formData.studentId,
          year: formData.year,
          department: formData.department,
          emergencyContact: formData.emergencyContact,
        }),
        // Counselor fields
        ...(formData.role === 'counselor' && {
          licenseNumber: formData.licenseNumber,
          specializations: formData.specializations.split(',').map(s => s.trim()),
          experience: formData.experience,
          qualifications: formData.qualifications,
        }),
        // Volunteer fields
        ...(formData.role === 'volunteer' && {
          volunteerType: formData.volunteerType,
          availability: formData.availability,
          trainingCompleted: false,
        }),
      };

      await login(newUser);
      router.replace('/onboarding');
    } catch {
      console.log('Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join CampusMinds to start your wellness journey</Text>
          
          <View style={styles.demoNote}>
            <Text style={styles.demoNoteText}>
              💡 For testing, you can use the demo login credentials instead of creating a new account.
            </Text>
          </View>
        </View>

        <View style={styles.form}>
          {/* Basic Information */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              placeholder="Choose a username"
              autoCapitalize="none"
              testID="username-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              placeholder="Create a password"
              secureTextEntry
              testID="password-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password *</Text>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              placeholder="Confirm your password"
              secureTextEntry
              testID="confirm-password-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter your full name"
              testID="name-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              testID="email-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>College/University *</Text>
            <TextInput
              style={styles.input}
              value={formData.college}
              onChangeText={(text) => setFormData({ ...formData, college: text })}
              placeholder="Enter your college name"
              testID="college-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Type *</Text>
            <View style={styles.roleSelector}>
              {(['student', 'counselor', 'volunteer'] as const).map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleButton,
                    formData.role === role && styles.selectedRole
                  ]}
                  onPress={() => setFormData({ ...formData, role })}
                  testID={`role-${role}`}
                >
                  <Text style={[
                    styles.roleText,
                    formData.role === role && styles.selectedRoleText
                  ]}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Role-specific fields */}
          {formData.role === 'student' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Student ID *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.studentId}
                  onChangeText={(text) => setFormData({ ...formData, studentId: text })}
                  placeholder="Enter your student ID"
                  testID="student-id-input"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Year of Study *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.year}
                  onChangeText={(text) => setFormData({ ...formData, year: text })}
                  placeholder="e.g., 1st Year, 2nd Year"
                  testID="year-input"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Department *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.department}
                  onChangeText={(text) => setFormData({ ...formData, department: text })}
                  placeholder="Enter your department"
                  testID="department-input"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Emergency Contact</Text>
                <TextInput
                  style={styles.input}
                  value={formData.emergencyContact}
                  onChangeText={(text) => setFormData({ ...formData, emergencyContact: text })}
                  placeholder="Emergency contact number"
                  keyboardType="phone-pad"
                  testID="emergency-contact-input"
                />
              </View>
            </>
          )}

          {formData.role === 'counselor' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>License Number *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.licenseNumber}
                  onChangeText={(text) => setFormData({ ...formData, licenseNumber: text })}
                  placeholder="Professional license number"
                  testID="license-input"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Specializations *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.specializations}
                  onChangeText={(text) => setFormData({ ...formData, specializations: text })}
                  placeholder="e.g., Anxiety, Depression, PTSD (comma separated)"
                  multiline
                  testID="specializations-input"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Years of Experience *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.experience}
                  onChangeText={(text) => setFormData({ ...formData, experience: text })}
                  placeholder="Years of professional experience"
                  keyboardType="numeric"
                  testID="experience-input"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Qualifications</Text>
                <TextInput
                  style={styles.input}
                  value={formData.qualifications}
                  onChangeText={(text) => setFormData({ ...formData, qualifications: text })}
                  placeholder="Educational qualifications and certifications"
                  multiline
                  testID="qualifications-input"
                />
              </View>
            </>
          )}

          {formData.role === 'volunteer' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Volunteer Type *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.volunteerType}
                  onChangeText={(text) => setFormData({ ...formData, volunteerType: text })}
                  placeholder="e.g., Peer Support, Crisis Support"
                  testID="volunteer-type-input"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Availability *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.availability}
                  onChangeText={(text) => setFormData({ ...formData, availability: text })}
                  placeholder="e.g., Weekdays 6-9 PM, Weekends"
                  testID="availability-input"
                />
              </View>
            </>
          )}

          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              * Required fields. {formData.role === 'counselor' ? 'Counselor accounts require admin approval.' : formData.role === 'volunteer' ? 'Volunteer accounts require training completion.' : ''}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={isLoading}
            testID="register-button"
          >
            <Text style={styles.registerButtonText}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.push('/(auth)/login')}
            testID="login-link"
          >
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.linkText}>Sign In</Text>
            </Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  backButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
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
  roleSelector: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  roleButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  selectedRole: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  selectedRoleText: {
    color: theme.colors.surface,
  },
  registerButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  disabledButton: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  loginLinkText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  linkText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  noteContainer: {
    backgroundColor: theme.colors.calm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  noteText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  demoNote: {
    backgroundColor: theme.colors.calm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.lg,
  },
  demoNoteText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});