import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { 
  ArrowLeft, 
  Phone, 
  MessageSquare, 
  Globe, 
  MapPin,
  Clock,
  AlertTriangle,
  Heart,
  Shield
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';

interface EmergencyContact {
  id: string;
  name: string;
  description: string;
  phone?: string;
  text?: string;
  website?: string;
  hours: string;
  type: 'crisis' | 'support' | 'local';
  icon: React.ReactNode;
}

export default function EmergencyContactsScreen() {
  const emergencyContacts: EmergencyContact[] = [
    {
      id: '1',
      name: 'National Suicide Prevention Lifeline',
      description: 'Free and confidential emotional support for people in suicidal crisis or emotional distress',
      phone: '988',
      hours: '24/7',
      type: 'crisis',
      icon: <AlertTriangle size={24} color={theme.colors.error} />
    },
    {
      id: '2',
      name: 'Crisis Text Line',
      description: 'Free, 24/7 support for those in crisis. Text with a trained crisis counselor',
      text: '741741',
      hours: '24/7',
      type: 'crisis',
      icon: <MessageSquare size={24} color={theme.colors.primary} />
    },
    {
      id: '3',
      name: 'Emergency Services',
      description: 'For immediate life-threatening emergencies',
      phone: '911',
      hours: '24/7',
      type: 'crisis',
      icon: <Phone size={24} color={theme.colors.error} />
    },
    {
      id: '4',
      name: 'SAMHSA National Helpline',
      description: 'Treatment referral and information service for mental health and substance abuse',
      phone: '1-800-662-4357',
      website: 'https://www.samhsa.gov/find-help/national-helpline',
      hours: '24/7',
      type: 'support',
      icon: <Heart size={24} color={theme.colors.secondary} />
    },
    {
      id: '5',
      name: 'National Alliance on Mental Illness',
      description: 'Information, support, and resources for mental health conditions',
      phone: '1-800-950-6264',
      website: 'https://www.nami.org',
      hours: 'Mon-Fri 10am-10pm ET',
      type: 'support',
      icon: <Shield size={24} color={theme.colors.focus} />
    },
    {
      id: '6',
      name: 'Campus Counseling Center',
      description: 'Your college counseling and psychological services',
      phone: '(555) 123-4567',
      hours: 'Mon-Fri 8am-5pm',
      type: 'local',
      icon: <MapPin size={24} color={theme.colors.accent} />
    },
    {
      id: '7',
      name: 'Campus Security',
      description: 'Campus safety and security services',
      phone: '(555) 123-4568',
      hours: '24/7',
      type: 'local',
      icon: <Shield size={24} color={theme.colors.primaryDark} />
    }
  ];

  const handlePhoneCall = (phone: string, name: string) => {
    Alert.alert(
      'Call ' + name,
      'Are you sure you want to call ' + phone + '?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL(`tel:${phone}`) }
      ]
    );
  };

  const handleTextMessage = (number: string, name: string) => {
    Alert.alert(
      'Text ' + name,
      'This will open your messaging app to text ' + number,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Text', onPress: () => Linking.openURL(`sms:${number}`) }
      ]
    );
  };

  const handleWebsite = (url: string) => {
    Linking.openURL(url);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'crisis':
        return theme.colors.error;
      case 'support':
        return theme.colors.primary;
      case 'local':
        return theme.colors.secondary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'crisis':
        return 'Crisis Support';
      case 'support':
        return 'Mental Health Support';
      case 'local':
        return 'Campus Resources';
      default:
        return 'Support';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Emergency Contacts',
          headerStyle: { backgroundColor: theme.colors.error },
          headerTintColor: theme.colors.surface,
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={theme.colors.surface} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Crisis Alert */}
        <View style={styles.crisisAlert}>
          <AlertTriangle size={32} color={theme.colors.surface} />
          <View style={styles.crisisContent}>
            <Text style={styles.crisisTitle}>In Crisis? Get Help Now</Text>
            <Text style={styles.crisisText}>
              If you are having thoughts of suicide or self-harm, please reach out immediately. 
              You are not alone, and help is available 24/7.
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => handlePhoneCall('988', 'Suicide Prevention Lifeline')}
          >
            <Phone size={20} color={theme.colors.surface} />
            <Text style={styles.quickActionText}>Call 988</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => handleTextMessage('741741', 'Crisis Text Line')}
          >
            <MessageSquare size={20} color={theme.colors.surface} />
            <Text style={styles.quickActionText}>Text 741741</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => handlePhoneCall('911', 'Emergency Services')}
          >
            <AlertTriangle size={20} color={theme.colors.surface} />
            <Text style={styles.quickActionText}>Call 911</Text>
          </TouchableOpacity>
        </View>

        {/* All Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Emergency & Support Contacts</Text>
          
          {emergencyContacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <View style={styles.contactIcon}>
                  {contact.icon}
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <View style={[styles.typeBadge, { backgroundColor: getTypeColor(contact.type) }]}>
                    <Text style={styles.typeBadgeText}>{getTypeLabel(contact.type)}</Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.contactDescription}>{contact.description}</Text>
              
              <View style={styles.contactMeta}>
                <View style={styles.hoursContainer}>
                  <Clock size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.hoursText}>{contact.hours}</Text>
                </View>
              </View>
              
              <View style={styles.contactActions}>
                {contact.phone && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handlePhoneCall(contact.phone!, contact.name)}
                  >
                    <Phone size={16} color={theme.colors.surface} />
                    <Text style={styles.actionButtonText}>Call {contact.phone}</Text>
                  </TouchableOpacity>
                )}
                
                {contact.text && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.textButton]}
                    onPress={() => handleTextMessage(contact.text!, contact.name)}
                  >
                    <MessageSquare size={16} color={theme.colors.surface} />
                    <Text style={styles.actionButtonText}>Text {contact.text}</Text>
                  </TouchableOpacity>
                )}
                
                {contact.website && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.websiteButton]}
                    onPress={() => handleWebsite(contact.website!)}
                  >
                    <Globe size={16} color={theme.colors.surface} />
                    <Text style={styles.actionButtonText}>Visit Website</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Additional Resources */}
        <View style={styles.resourcesCard}>
          <Text style={styles.resourcesTitle}>Additional Resources</Text>
          <Text style={styles.resourcesText}>
            • Campus Health Center: Available for medical emergencies and health concerns{'\n'}
            • Student Affairs Office: Support for academic and personal challenges{'\n'}
            • Resident Advisor: If you live on campus, your RA is trained to help{'\n'}
            • Trusted Friend or Family Member: Reach out to someone you trust{'\n'}
            • Campus Chaplain: Spiritual support and counseling services
          </Text>
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
  backButton: {
    padding: theme.spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  crisisAlert: {
    backgroundColor: theme.colors.error,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  crisisContent: {
    flex: 1,
  },
  crisisTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.surface,
    marginBottom: theme.spacing.sm,
  },
  crisisText: {
    fontSize: 16,
    color: theme.colors.surface,
    lineHeight: 24,
  },
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: theme.colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  contactCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.surface,
  },
  contactDescription: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  contactMeta: {
    marginBottom: theme.spacing.md,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  hoursText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  contactActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  textButton: {
    backgroundColor: theme.colors.secondary,
  },
  websiteButton: {
    backgroundColor: theme.colors.focus,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.surface,
  },
  resourcesCard: {
    backgroundColor: theme.colors.calm,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.focus,
  },
  resourcesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  resourcesText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});