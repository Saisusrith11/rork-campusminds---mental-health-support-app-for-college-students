import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Filter,

} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';
import type { Appointment } from '@/types/user';

// Mock appointment data
const mockAppointments: Appointment[] = [
  {
    id: '1',
    studentId: 'current-user',
    counselorId: 'counselor-1',
    date: '2024-01-15',
    time: '10:00 AM',
    duration: 60,
    status: 'completed',
    type: 'individual',
    notes: 'Initial consultation session',
    studentRiskLevel: 'moderate',
    studentAssessmentScore: 18
  },
  {
    id: '2',
    studentId: 'current-user',
    counselorId: 'counselor-2',
    date: '2024-01-22',
    time: '2:00 PM',
    duration: 45,
    status: 'completed',
    type: 'individual',
    notes: 'Follow-up session on anxiety management',
    studentRiskLevel: 'moderate',
    studentAssessmentScore: 15
  },
  {
    id: '3',
    studentId: 'current-user',
    counselorId: 'counselor-1',
    date: '2024-01-29',
    time: '11:00 AM',
    duration: 60,
    status: 'approved',
    type: 'individual',
    studentRiskLevel: 'minimal',
    studentAssessmentScore: 12
  },
  {
    id: '4',
    studentId: 'current-user',
    counselorId: 'counselor-3',
    date: '2024-02-05',
    time: '3:00 PM',
    duration: 60,
    status: 'pending',
    type: 'individual',
    studentRiskLevel: 'minimal',
    studentAssessmentScore: 10
  },
  {
    id: '5',
    studentId: 'current-user',
    counselorId: 'counselor-2',
    date: '2024-01-08',
    time: '9:00 AM',
    duration: 60,
    status: 'cancelled',
    type: 'individual',
    notes: 'Cancelled due to scheduling conflict',
    studentRiskLevel: 'high',
    studentAssessmentScore: 25
  }
];

const counselorNames: Record<string, string> = {
  'counselor-1': 'Dr. Sarah Johnson',
  'counselor-2': 'Dr. Michael Chen',
  'counselor-3': 'Dr. Emily Rodriguez'
};

const statusColors = {
  completed: theme.colors.success,
  approved: theme.colors.primary,
  pending: theme.colors.warning,
  cancelled: theme.colors.error,
  declined: theme.colors.error
};

const statusIcons = {
  completed: CheckCircle,
  approved: Calendar,
  pending: Clock,
  cancelled: XCircle,
  declined: XCircle
};

export default function BookingHistoryScreen() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'completed', label: 'Completed' },
    { key: 'approved', label: 'Upcoming' },
    { key: 'pending', label: 'Pending' },
    { key: 'cancelled', label: 'Cancelled' }
  ];

  const filteredAppointments = useMemo(() => {
    if (selectedFilter === 'all') {
      return mockAppointments;
    }
    return mockAppointments.filter(appointment => appointment.status === selectedFilter);
  }, [selectedFilter]);

  const sortedAppointments = useMemo(() => {
    return [...filteredAppointments].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
  }, [filteredAppointments]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'approved': return 'Upcoming';
      case 'pending': return 'Pending Approval';
      case 'cancelled': return 'Cancelled';
      case 'declined': return 'Declined';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isUpcoming = (appointment: Appointment) => {
    const appointmentDate = new Date(`${appointment.date} ${appointment.time}`);
    return appointmentDate > new Date() && appointment.status === 'approved';
  };

  const isPast = (appointment: Appointment) => {
    const appointmentDate = new Date(`${appointment.date} ${appointment.time}`);
    return appointmentDate < new Date();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking History</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Filter Section */}
        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <Filter size={20} color={theme.colors.primary} />
            <Text style={styles.filterTitle}>Filter Appointments</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScrollView}
          >
            <View style={styles.filterButtons}>
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter.key && styles.filterButtonActive
                  ]}
                  onPress={() => setSelectedFilter(filter.key)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    selectedFilter === filter.key && styles.filterButtonTextActive
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Statistics */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {mockAppointments.filter(a => a.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {mockAppointments.filter(a => a.status === 'approved').length}
            </Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {mockAppointments.filter(a => a.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Appointments List */}
        <View style={styles.appointmentsSection}>
          <Text style={styles.sectionTitle}>
            {selectedFilter === 'all' ? 'All Appointments' : `${filters.find(f => f.key === selectedFilter)?.label} Appointments`}
          </Text>
          
          {sortedAppointments.length > 0 ? (
            <View style={styles.appointmentsList}>
              {sortedAppointments.map((appointment) => {
                const StatusIcon = statusIcons[appointment.status];
                const isUpcomingAppointment = isUpcoming(appointment);
                
                return (
                  <View 
                    key={appointment.id} 
                    style={[
                      styles.appointmentCard,
                      isUpcomingAppointment && styles.upcomingCard
                    ]}
                  >
                    <View style={styles.appointmentHeader}>
                      <View style={styles.appointmentStatus}>
                        <StatusIcon 
                          size={16} 
                          color={statusColors[appointment.status]} 
                        />
                        <Text style={[
                          styles.statusText,
                          { color: statusColors[appointment.status] }
                        ]}>
                          {getStatusText(appointment.status)}
                        </Text>
                      </View>
                      
                      {isUpcomingAppointment && (
                        <View style={styles.upcomingBadge}>
                          <Text style={styles.upcomingBadgeText}>Upcoming</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.appointmentDetails}>
                      <View style={styles.appointmentInfo}>
                        <View style={styles.infoRow}>
                          <Calendar size={16} color={theme.colors.textSecondary} />
                          <Text style={styles.infoText}>
                            {formatDate(appointment.date)}
                          </Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                          <Clock size={16} color={theme.colors.textSecondary} />
                          <Text style={styles.infoText}>
                            {appointment.time} ({appointment.duration} min)
                          </Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                          <User size={16} color={theme.colors.textSecondary} />
                          <Text style={styles.infoText}>
                            {counselorNames[appointment.counselorId] || 'Unknown Counselor'}
                          </Text>
                        </View>
                      </View>

                      {appointment.studentRiskLevel && (
                        <View style={styles.riskLevel}>
                          <AlertCircle 
                            size={14} 
                            color={
                              appointment.studentRiskLevel === 'high' ? theme.colors.error :
                              appointment.studentRiskLevel === 'moderate' ? theme.colors.warning :
                              theme.colors.success
                            } 
                          />
                          <Text style={[
                            styles.riskText,
                            {
                              color: appointment.studentRiskLevel === 'high' ? theme.colors.error :
                                     appointment.studentRiskLevel === 'moderate' ? theme.colors.warning :
                                     theme.colors.success
                            }
                          ]}>
                            {appointment.studentRiskLevel.charAt(0).toUpperCase() + appointment.studentRiskLevel.slice(1)} Risk
                          </Text>
                        </View>
                      )}
                    </View>

                    {appointment.notes && (
                      <View style={styles.notesSection}>
                        <Text style={styles.notesLabel}>Notes:</Text>
                        <Text style={styles.notesText}>{appointment.notes}</Text>
                      </View>
                    )}

                    {isUpcomingAppointment && (
                      <View style={styles.appointmentActions}>
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => {
                            if (appointment?.id?.trim()) {
                              console.log('Reschedule appointment:', appointment.id.trim());
                            }
                          }}
                        >
                          <Text style={styles.actionButtonText}>Reschedule</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.cancelButton]}
                          onPress={() => {
                            if (appointment?.id?.trim()) {
                              console.log('Cancel appointment:', appointment.id.trim());
                            }
                          }}
                        >
                          <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyStateText}>No appointments found</Text>
              <Text style={styles.emptyStateSubtext}>
                {selectedFilter === 'all' 
                  ? 'You haven\'t booked any appointments yet'
                  : `No ${selectedFilter} appointments found`
                }
              </Text>
              
              <TouchableOpacity 
                style={styles.bookButton}
                onPress={() => router.push('/book-session')}
              >
                <Text style={styles.bookButtonText}>Book New Session</Text>
              </TouchableOpacity>
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  filterSection: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  filterScrollView: {
    marginHorizontal: -theme.spacing.lg,
  },
  filterButtons: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  filterButtonTextActive: {
    color: theme.colors.surface,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  appointmentsSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  appointmentsList: {
    gap: theme.spacing.md,
  },
  appointmentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  upcomingCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  appointmentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  upcomingBadge: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  upcomingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  appointmentDetails: {
    marginBottom: theme.spacing.md,
  },
  appointmentInfo: {
    gap: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  riskLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notesSection: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  notesText: {
    fontSize: 14,
    color: theme.colors.text,
    fontStyle: 'italic',
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  cancelButtonText: {
    color: theme.colors.error,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  bookButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});