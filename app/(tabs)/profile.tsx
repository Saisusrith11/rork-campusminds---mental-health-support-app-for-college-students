import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Phone,
  Heart,
  BarChart3,
  Calendar,
  Globe,
  X,

} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/auth-store';
import { useMood } from '@/hooks/mood-store';
import { useLanguage } from '@/hooks/language-store';
import { emergencyContacts } from '@/data/resources';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { moods } = useMood();
  const { currentLanguage, changeLanguage, translate } = useLanguage();
  const insets = useSafeAreaInsets();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [notifications, setNotifications] = useState({
    moodReminders: true,
    appointmentAlerts: true,
    resourceUpdates: false,
    communityUpdates: true
  });

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' }
  ];

  const handleLogout = () => {
    console.log('Logout requested');
    logout();
  };

  const handleEmergencyContact = (contact: typeof emergencyContacts[0]) => {
    if (contact?.phone?.trim() && contact.phone.length <= 20) {
      console.log(`Emergency contact: ${contact.name} - ${contact.phone}`);
    }
  };

  const handleLanguageSelect = (languageCode: string) => {
    if (!languageCode?.trim()) return;
    changeLanguage(languageCode as any);
    setShowLanguageModal(false);
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const menuItems = [
    {
      icon: Settings,
      title: translate('settings', 'Settings'),
      subtitle: translate('appPreferencesAndNotifications', 'App preferences and notifications'),
      onPress: () => setShowLanguageModal(true),
    },
    {
      icon: Bell,
      title: translate('notifications', 'Notifications'),
      subtitle: translate('manageNotificationPreferences', 'Manage your notification preferences'),
      onPress: () => setShowNotificationSettings(true),
    },
    {
      icon: Shield,
      title: translate('privacyAndSafety', 'Privacy & Safety'),
      subtitle: translate('controlDataAndPrivacy', 'Control your data and privacy'),
      onPress: () => setShowPrivacySettings(true),
    },
    {
      icon: Calendar,
      title: translate('bookingHistory', 'Booking History'),
      subtitle: translate('viewPastAppointments', 'View past appointments'),
      onPress: () => router.push('/booking-history'),
    },
    {
      icon: BarChart3,
      title: translate('moodTracking', 'Mood Tracking'),
      subtitle: translate('viewMoodAnalysis', 'View mood analysis'),
      onPress: () => router.push('/mood-tracking'),
    },
    {
      icon: HelpCircle,
      title: translate('helpAndSupport', 'Help & Support'),
      subtitle: translate('getHelpAndContactSupport', 'Get help and contact support'),
      onPress: () => console.log('Help center coming soon'),
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <User size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.userRole}>
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'} • {user?.college || 'University'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <BarChart3 size={24} color={theme.colors.primary} />
            <Text style={styles.statNumber}>{moods.length}</Text>
            <Text style={styles.statLabel}>Mood Entries</Text>
          </View>
          <View style={styles.statCard}>
            <Heart size={24} color={theme.colors.error} />
            <Text style={styles.statNumber}>
              {Math.max(1, Math.floor(moods.length / 7))}
            </Text>
            <Text style={styles.statLabel}>Weeks Active</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={styles.menuItem}
              onPress={item.onPress}
              testID={`menu-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <item.icon size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <ChevronRight size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          {emergencyContacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.emergencyItem}
              onPress={() => handleEmergencyContact(contact)}
              testID={`emergency-${contact.id}`}
            >
              <View style={styles.emergencyIcon}>
                <Phone size={20} color={theme.colors.error} />
              </View>
              <View style={styles.emergencyText}>
                <Text style={styles.emergencyName}>{contact.name}</Text>
                <Text style={styles.emergencyDescription}>{contact.description}</Text>
                <Text style={styles.emergencyPhone}>{contact.phone}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          testID="logout-button"
        >
          <LogOut size={20} color={theme.colors.error} />
          <Text style={styles.logoutText}>{translate('signOut', 'Sign Out')}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>CampusMinds v1.0.0</Text>
          <Text style={styles.footerText}>{translate('yourMentalHealthCompanion', 'Your mental health companion')}</Text>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{translate('selectLanguage', 'Select Language')}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  currentLanguage === language.code && styles.selectedLanguage
                ]}
                onPress={() => handleLanguageSelect(language.code)}
              >
                <Globe size={20} color={theme.colors.primary} />
                <View style={styles.languageInfo}>
                  <Text style={styles.languageName}>{language.name}</Text>
                  <Text style={styles.languageNative}>{language.nativeName}</Text>
                </View>
                {currentLanguage === language.code && (
                  <View style={styles.selectedIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Notification Settings Modal */}
      <Modal
        visible={showNotificationSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotificationSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{translate('notificationSettings', 'Notification Settings')}</Text>
              <TouchableOpacity onPress={() => setShowNotificationSettings(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            {Object.entries(notifications).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                style={styles.notificationOption}
                onPress={() => toggleNotification(key as keyof typeof notifications)}
              >
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationTitle}>
                    {translate(key, key.replace(/([A-Z])/g, ' $1').toLowerCase())}
                  </Text>
                  <Text style={styles.notificationSubtitle}>
                    {translate(`${key}Description`, 'Manage this notification type')}
                  </Text>
                </View>
                <View style={[styles.toggle, value && styles.toggleActive]}>
                  <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Privacy Settings Modal */}
      <Modal
        visible={showPrivacySettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPrivacySettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{translate('privacyAndSafety', 'Privacy & Safety')}</Text>
              <TouchableOpacity onPress={() => setShowPrivacySettings(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.privacySection}>
              <Text style={styles.privacyTitle}>{translate('dataProtection', 'Data Protection')}</Text>
              <Text style={styles.privacyText}>
                • {translate('allConversationsEncrypted', 'All conversations are encrypted')}
              </Text>
              <Text style={styles.privacyText}>
                • {translate('noPersonalDataShared', 'No personal data is shared')}
              </Text>
              <Text style={styles.privacyText}>
                • {translate('anonymousAnalyticsOnly', 'Only anonymous analytics collected')}
              </Text>
            </View>
            <View style={styles.privacySection}>
              <Text style={styles.privacyTitle}>{translate('yourRights', 'Your Rights')}</Text>
              <Text style={styles.privacyText}>
                • {translate('rightToDataDeletion', 'Right to data deletion')}
              </Text>
              <Text style={styles.privacyText}>
                • {translate('rightToDataPortability', 'Right to data portability')}
              </Text>
              <Text style={styles.privacyText}>
                • {translate('rightToOptOut', 'Right to opt out')}
              </Text>
            </View>
            <View style={styles.privacySection}>
              <Text style={styles.privacyTitle}>{translate('emergencyProtocol', 'Emergency Protocol')}</Text>
              <Text style={styles.privacyText}>
                • {translate('crisisDetectionActive', 'Crisis detection is active')}
              </Text>
              <Text style={styles.privacyText}>
                • {translate('automaticReferralSystem', 'Automatic referral system')}
              </Text>
              <Text style={styles.privacyText}>
                • {translate('24x7EmergencySupport', '24x7 emergency support available')}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emergencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: '#FFF5F5',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  emergencyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(225, 112, 85, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  emergencyText: {
    flex: 1,
  },
  emergencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  emergencyDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  emergencyPhone: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.error,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
    marginBottom: theme.spacing.xl,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  selectedLanguage: {
    backgroundColor: theme.colors.primary + '10',
  },
  languageInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  languageNative: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  notificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  notificationSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.surface,
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  privacySection: {
    marginBottom: theme.spacing.lg,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  privacyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
});