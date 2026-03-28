import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Calendar, Clock, User, Star, ArrowLeft } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';

interface Counselor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  availability: string[];
  bio: string;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export default function BookSessionScreen() {
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const counselors: Counselor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialization: 'Anxiety & Depression',
      experience: '8 years',
      rating: 4.9,
      availability: ['Monday', 'Wednesday', 'Friday'],
      bio: 'Specialized in cognitive behavioral therapy and mindfulness-based interventions for students.'
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialization: 'Stress Management',
      experience: '6 years',
      rating: 4.8,
      availability: ['Tuesday', 'Thursday', 'Saturday'],
      bio: 'Expert in stress reduction techniques and academic performance anxiety.'
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      specialization: 'Sleep & Wellness',
      experience: '10 years',
      rating: 4.9,
      availability: ['Monday', 'Tuesday', 'Thursday'],
      bio: 'Focuses on sleep disorders, wellness coaching, and holistic mental health approaches.'
    }
  ];

  const timeSlots: TimeSlot[] = [
    { id: '1', time: '9:00 AM', available: true },
    { id: '2', time: '10:00 AM', available: true },
    { id: '3', time: '11:00 AM', available: false },
    { id: '4', time: '2:00 PM', available: true },
    { id: '5', time: '3:00 PM', available: true },
    { id: '6', time: '4:00 PM', available: false },
  ];

  const dates = [
    'Today, Dec 18',
    'Tomorrow, Dec 19',
    'Thu, Dec 20',
    'Fri, Dec 21',
    'Mon, Dec 24'
  ];

  const handleBookSession = () => {
    if (!selectedCounselor || !selectedDate || !selectedTime) {
      Alert.alert('Incomplete Selection', 'Please select a counselor, date, and time slot.');
      return;
    }

    Alert.alert(
      'Booking Confirmation',
      `Your session with ${selectedCounselor.name} has been requested for ${selectedDate} at ${selectedTime}. You will receive a confirmation email shortly.`,
      [
        { text: 'OK', onPress: () => router.back() }
      ]
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        color={index < Math.floor(rating) ? theme.colors.warning : theme.colors.border}
        fill={index < Math.floor(rating) ? theme.colors.warning : 'transparent'}
      />
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Book Counselor Session',
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
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Counselors Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Counselor</Text>
          <Text style={styles.sectionSubtitle}>
            All our counselors are licensed professionals with experience in student mental health
          </Text>
          
          {counselors.map((counselor) => (
            <TouchableOpacity
              key={counselor.id}
              style={[
                styles.counselorCard,
                selectedCounselor?.id === counselor.id && styles.selectedCard
              ]}
              onPress={() => setSelectedCounselor(counselor)}
            >
              <View style={styles.counselorHeader}>
                <View style={styles.counselorAvatar}>
                  <User size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.counselorInfo}>
                  <Text style={styles.counselorName}>{counselor.name}</Text>
                  <Text style={styles.counselorSpecialization}>{counselor.specialization}</Text>
                  <View style={styles.counselorMeta}>
                    <View style={styles.ratingContainer}>
                      {renderStars(counselor.rating)}
                      <Text style={styles.ratingText}>{counselor.rating}</Text>
                    </View>
                    <Text style={styles.experienceText}>{counselor.experience}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.counselorBio}>{counselor.bio}</Text>
              <Text style={styles.availabilityText}>
                Available: {counselor.availability.join(', ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Selection */}
        {selectedCounselor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {dates.map((date, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateCard,
                    selectedDate === date && styles.selectedDateCard
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Calendar size={20} color={selectedDate === date ? theme.colors.surface : theme.colors.primary} />
                  <Text style={[
                    styles.dateText,
                    selectedDate === date && styles.selectedDateText
                  ]}>
                    {date}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Time Selection */}
        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Time</Text>
            <View style={styles.timeGrid}>
              {timeSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.timeSlot,
                    !slot.available && styles.unavailableSlot,
                    selectedTime === slot.time && styles.selectedTimeSlot
                  ]}
                  onPress={() => slot.available && setSelectedTime(slot.time)}
                  disabled={!slot.available}
                >
                  <Clock size={16} color={
                    !slot.available ? theme.colors.textSecondary :
                    selectedTime === slot.time ? theme.colors.surface : theme.colors.primary
                  } />
                  <Text style={[
                    styles.timeText,
                    !slot.available && styles.unavailableText,
                    selectedTime === slot.time && styles.selectedTimeText
                  ]}>
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Booking Summary */}
        {selectedCounselor && selectedDate && selectedTime && (
          <View style={styles.section}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Booking Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Counselor:</Text>
                <Text style={styles.summaryValue}>{selectedCounselor.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date:</Text>
                <Text style={styles.summaryValue}>{selectedDate}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Time:</Text>
                <Text style={styles.summaryValue}>{selectedTime}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration:</Text>
                <Text style={styles.summaryValue}>50 minutes</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Book Button */}
      {selectedCounselor && selectedDate && selectedTime && (
        <View style={styles.bookingFooter}>
          <TouchableOpacity style={styles.bookButton} onPress={handleBookSession}>
            <Text style={styles.bookButtonText}>Book Session</Text>
          </TouchableOpacity>
        </View>
      )}
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
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  counselorCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  selectedCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.calm,
  },
  counselorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  counselorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.calm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  counselorInfo: {
    flex: 1,
  },
  counselorName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  counselorSpecialization: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
    marginBottom: theme.spacing.sm,
  },
  counselorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  experienceText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  counselorBio: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  availabilityText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  dateScroll: {
    marginHorizontal: -theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  dateCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 100,
  },
  selectedDateCard: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
  },
  selectedDateText: {
    color: theme.colors.surface,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  timeSlot: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: '45%',
  },
  selectedTimeSlot: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  unavailableSlot: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    opacity: 0.5,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  selectedTimeText: {
    color: theme.colors.surface,
  },
  unavailableText: {
    color: theme.colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  bookingFooter: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  bookButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});