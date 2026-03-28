import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Calendar, 
  Users, 
  FileText, 
  MessageCircle, 
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  BookOpen,
  Activity,
  Upload
} from 'lucide-react-native';
import FileUploadModal from '@/components/FileUploadModal';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/auth-store';
import { useAppointments } from '@/hooks/appointment-store';
import { useNotifications } from '@/hooks/notification-store';
import { router } from 'expo-router';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  onPress?: () => void;
}

function StatCard({ title, value, icon, color, onPress }: StatCardProps) {
  return (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.statIcon}>
        {icon}
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

interface AppointmentItemProps {
  appointment: any;
  onApprove: (id: string) => void;
  onDecline: (id: string, reason: string) => void;
}

function AppointmentItem({ appointment, onApprove, onDecline }: AppointmentItemProps) {
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'high': return theme.colors.error;
      case 'moderate': return theme.colors.warning;
      case 'minimal': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  };

  const handleDecline = () => {
    if (declineReason.trim()) {
      onDecline(appointment.id, declineReason);
      setShowDeclineModal(false);
      setDeclineReason('');
    } else {
      Alert.alert('Error', 'Please provide a reason for declining');
    }
  };

  return (
    <View style={styles.appointmentItem}>
      <View style={styles.appointmentHeader}>
        <View style={styles.appointmentInfo}>
          <Text style={styles.appointmentStudent}>{appointment.studentName}</Text>
          <Text style={styles.appointmentTime}>
            {appointment.date} at {appointment.time}
          </Text>
          {appointment.assessmentScore && (
            <View style={styles.riskIndicator}>
              <View style={[styles.riskDot, { backgroundColor: getRiskColor(appointment.riskLevel) }]} />
              <Text style={[styles.riskText, { color: getRiskColor(appointment.riskLevel) }]}>
                Score: {appointment.assessmentScore} ({appointment.riskLevel})
              </Text>
            </View>
          )}
        </View>
        
        {appointment.status === 'pending' && (
          <View style={styles.appointmentActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => onApprove(appointment.id)}
            >
              <CheckCircle size={16} color={theme.colors.surface} />
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => setShowDeclineModal(true)}
            >
              <XCircle size={16} color={theme.colors.surface} />
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal
        visible={showDeclineModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDeclineModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Decline Appointment</Text>
            <Text style={styles.modalSubtitle}>
              Please provide a reason for declining this appointment:
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter reason..."
              value={declineReason}
              onChangeText={setDeclineReason}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowDeclineModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleDecline}
              >
                <Text style={styles.modalConfirmText}>Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function CounselorHomeScreen() {
  const { user } = useAuth();
  const { appointments, appointmentStats, updateAppointmentStatus } = useAppointments();
  const { unreadCount } = useNotifications();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'pending' || apt.status === 'approved')
    .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())
    .slice(0, 5);

  const handleApproveAppointment = async (appointmentId: string) => {
    try {
      await updateAppointmentStatus(appointmentId, 'approved');
      Alert.alert('Success', 'Appointment approved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to approve appointment');
    }
  };

  const handleDeclineAppointment = async (appointmentId: string, reason: string) => {
    try {
      await updateAppointmentStatus(appointmentId, 'declined', reason);
      Alert.alert('Success', 'Appointment declined');
    } catch (error) {
      Alert.alert('Error', 'Failed to decline appointment');
    }
  };

  const handleFileUpload = (file: any, fileName: string) => {
    console.log('File uploaded:', { fileName, file });
    // Here you would typically upload the file to your server
    // For now, we'll just log it
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>Dr. {user?.name || 'Counselor'}</Text>
            <Text style={styles.subtitle}>Your counseling dashboard</Text>
          </View>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Pending Appointments"
              value={appointmentStats.pending}
              icon={<Clock size={24} color={theme.colors.warning} />}
              color={theme.colors.warning}
              onPress={() => router.push('/(tabs)/chat')}
            />
            <StatCard
              title="Completed Sessions"
              value={appointmentStats.completed}
              icon={<CheckCircle size={24} color={theme.colors.success} />}
              color={theme.colors.success}
            />
            <StatCard
              title="High Risk Students"
              value={appointmentStats.riskLevels.high}
              icon={<AlertTriangle size={24} color={theme.colors.error} />}
              color={theme.colors.error}
            />
            <StatCard
              title="Unread Messages"
              value={unreadCount}
              icon={<MessageCircle size={24} color={theme.colors.primary} />}
              color={theme.colors.primary}
              onPress={() => router.push('/(tabs)/chat')}
            />
          </View>
        </View>

        {/* Upcoming Appointments */}
        <View style={styles.appointmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/chat')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <AppointmentItem
                key={appointment.id}
                appointment={appointment}
                onApprove={handleApproveAppointment}
                onDecline={handleDeclineAppointment}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyStateText}>No upcoming appointments</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/(tabs)/resources')}
            >
              <LinearGradient 
                colors={[theme.colors.primary, theme.colors.secondary]} 
                style={styles.quickActionGradient}
              >
                <BookOpen size={24} color={theme.colors.surface} />
                <Text style={styles.quickActionText}>Manage Resources</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/wellness-activities')}
            >
              <LinearGradient 
                colors={[theme.colors.success, theme.colors.calm]} 
                style={styles.quickActionGradient}
              >
                <Activity size={24} color={theme.colors.surface} />
                <Text style={styles.quickActionText}>Assign Activities</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <LinearGradient 
                colors={[theme.colors.focus, theme.colors.accent]} 
                style={styles.quickActionGradient}
              >
                <BarChart3 size={24} color={theme.colors.surface} />
                <Text style={styles.quickActionText}>View Analytics</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/(tabs)/chat')}
            >
              <LinearGradient 
                colors={[theme.colors.warning, theme.colors.energy]} 
                style={styles.quickActionGradient}
              >
                <MessageCircle size={24} color={theme.colors.surface} />
                <Text style={styles.quickActionText}>Student Chat</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => setShowUploadModal(true)}
            >
              <LinearGradient 
                colors={[theme.colors.accent, theme.colors.focus]} 
                style={styles.quickActionGradient}
              >
                <Upload size={24} color={theme.colors.surface} />
                <Text style={styles.quickActionText}>Upload Files</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
      
      <FileUploadModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleFileUpload}
      />
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
    marginBottom: theme.spacing.lg,
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
  statsSection: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  appointmentsSection: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  viewAllText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  appointmentItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentStudent: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  appointmentTime: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  riskIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  approveButton: {
    backgroundColor: theme.colors.success,
  },
  declineButton: {
    backgroundColor: theme.colors.error,
  },
  approveButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  declineButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  quickActionsSection: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionGradient: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.surface,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    textAlignVertical: 'top',
    marginBottom: theme.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: theme.colors.border,
  },
  modalConfirmButton: {
    backgroundColor: theme.colors.error,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});