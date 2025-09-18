import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './auth-store';
import { useNotifications } from './notification-store';

interface Appointment {
  id: string;
  studentId: string;
  studentName: string;
  counselorId: string;
  counselorName: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'approved' | 'declined' | 'completed' | 'cancelled';
  type: 'individual' | 'group' | 'emergency';
  notes?: string;
  assessmentScore?: number;
  riskLevel?: 'minimal' | 'moderate' | 'high';
  createdAt: number;
  updatedAt: number;
}

interface SessionNote {
  id: string;
  appointmentId: string;
  counselorId: string;
  studentId: string;
  content: string;
  goals: string[];
  progress: string;
  nextSteps: string;
  riskAssessment: 'low' | 'medium' | 'high';
  followUpRequired: boolean;
  createdAt: number;
  updatedAt: number;
}

const APPOINTMENTS_KEY = 'campusminds_appointments';
const SESSION_NOTES_KEY = 'campusminds_session_notes';

// Demo appointments data
const demoAppointments: Appointment[] = [
  {
    id: 'apt-001',
    studentId: 'student-001',
    studentName: 'Priya Sharma',
    counselorId: 'counselor-001',
    counselorName: 'Dr. Rajesh Kumar',
    date: '2024-01-20',
    time: '10:00',
    duration: 60,
    status: 'pending',
    type: 'individual',
    assessmentScore: 18,
    riskLevel: 'moderate',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000
  },
  {
    id: 'apt-002',
    studentId: 'student-002',
    studentName: 'Arjun Patel',
    counselorId: 'counselor-001',
    counselorName: 'Dr. Rajesh Kumar',
    date: '2024-01-21',
    time: '14:00',
    duration: 60,
    status: 'approved',
    type: 'individual',
    assessmentScore: 8,
    riskLevel: 'minimal',
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 86400000
  },
  {
    id: 'apt-003',
    studentId: 'student-003',
    studentName: 'Kavya Reddy',
    counselorId: 'counselor-001',
    counselorName: 'Dr. Rajesh Kumar',
    date: '2024-01-22',
    time: '11:30',
    duration: 60,
    status: 'completed',
    type: 'individual',
    assessmentScore: 28,
    riskLevel: 'high',
    notes: 'Student showed significant improvement after session',
    createdAt: Date.now() - 259200000,
    updatedAt: Date.now() - 172800000
  }
];

const demoSessionNotes: SessionNote[] = [
  {
    id: 'note-001',
    appointmentId: 'apt-003',
    counselorId: 'counselor-001',
    studentId: 'student-003',
    content: 'Student presented with high anxiety levels related to academic pressure. Discussed coping strategies and breathing techniques.',
    goals: ['Reduce anxiety levels', 'Improve sleep quality', 'Develop healthy study habits'],
    progress: 'Student showed good engagement and willingness to try suggested techniques.',
    nextSteps: 'Follow up in 1 week, assign mindfulness exercises, monitor sleep patterns',
    riskAssessment: 'medium',
    followUpRequired: true,
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 172800000
  }
];

export const [AppointmentProvider, useAppointments] = createContextHook(() => {
  const { user } = useAuth();
  const { sendAppointmentReminder, addNotification } = useNotifications();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAppointments();
      loadSessionNotes();
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      const stored = await AsyncStorage.getItem(APPOINTMENTS_KEY);
      if (stored && stored.trim()) {
        try {
          const parsed = JSON.parse(stored);
          setAppointments(Array.isArray(parsed) ? parsed : demoAppointments);
        } catch (parseError) {
          console.error('Failed to parse appointments, using demo data:', parseError);
          setAppointments(demoAppointments);
          await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(demoAppointments));
        }
      } else {
        // Load demo data for first time
        setAppointments(demoAppointments);
        await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(demoAppointments));
      }
    } catch (error) {
      console.error('Failed to load appointments:', error);
      setAppointments(demoAppointments);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessionNotes = async () => {
    try {
      const stored = await AsyncStorage.getItem(SESSION_NOTES_KEY);
      if (stored && stored.trim()) {
        try {
          const parsed = JSON.parse(stored);
          setSessionNotes(Array.isArray(parsed) ? parsed : demoSessionNotes);
        } catch (parseError) {
          console.error('Failed to parse session notes, using demo data:', parseError);
          setSessionNotes(demoSessionNotes);
          await AsyncStorage.setItem(SESSION_NOTES_KEY, JSON.stringify(demoSessionNotes));
        }
      } else {
        setSessionNotes(demoSessionNotes);
        await AsyncStorage.setItem(SESSION_NOTES_KEY, JSON.stringify(demoSessionNotes));
      }
    } catch (error) {
      console.error('Failed to load session notes:', error);
      setSessionNotes(demoSessionNotes);
    }
  };

  const saveAppointments = async (newAppointments: Appointment[]) => {
    try {
      await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(newAppointments));
      setAppointments(newAppointments);
    } catch (error) {
      console.error('Failed to save appointments:', error);
    }
  };

  const saveSessionNotes = async (newNotes: SessionNote[]) => {
    try {
      await AsyncStorage.setItem(SESSION_NOTES_KEY, JSON.stringify(newNotes));
      setSessionNotes(newNotes);
    } catch (error) {
      console.error('Failed to save session notes:', error);
    }
  };

  const bookAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `apt-${Date.now()}`,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updatedAppointments = [...appointments, newAppointment];
    await saveAppointments(updatedAppointments);

    // Send notification to counselor
    await addNotification({
      id: `notif-${Date.now()}`,
      title: 'New Appointment Request',
      body: `${appointmentData.studentName} has requested an appointment`,
      timestamp: Date.now(),
      read: false,
      type: 'appointment',
      priority: 'normal',
      userRole: 'counselor',
      data: { appointmentId: newAppointment.id }
    });

    return newAppointment;
  }, [appointments, addNotification]);

  const updateAppointmentStatus = useCallback(async (
    appointmentId: string, 
    status: Appointment['status'],
    notes?: string
  ) => {
    const updatedAppointments = appointments.map(apt => 
      apt.id === appointmentId 
        ? { ...apt, status, notes, updatedAt: Date.now() }
        : apt
    );
    await saveAppointments(updatedAppointments);

    // Send notification to student
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      let notificationTitle = '';
      let notificationBody = '';
      
      switch (status) {
        case 'approved':
          notificationTitle = 'Appointment Approved';
          notificationBody = `Your appointment with ${appointment.counselorName} has been approved`;
          // Schedule reminder
          await sendAppointmentReminder({
            id: appointmentId,
            counselorName: appointment.counselorName,
            reminderTime: 3600 // 1 hour before
          });
          break;
        case 'declined':
          notificationTitle = 'Appointment Declined';
          notificationBody = `Your appointment request has been declined. ${notes || 'Please book another time slot.'}`;
          break;
        case 'completed':
          notificationTitle = 'Session Completed';
          notificationBody = 'Your counseling session has been completed. Thank you!';
          break;
      }

      if (notificationTitle) {
        await addNotification({
          id: `notif-${Date.now()}`,
          title: notificationTitle,
          body: notificationBody,
          timestamp: Date.now(),
          read: false,
          type: 'appointment',
          priority: status === 'approved' ? 'high' : 'normal',
          userRole: 'student',
          data: { appointmentId }
        });
      }
    }
  }, [appointments, addNotification, sendAppointmentReminder]);

  const addSessionNote = useCallback(async (noteData: Omit<SessionNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: SessionNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updatedNotes = [...sessionNotes, newNote];
    await saveSessionNotes(updatedNotes);

    // Update appointment status to completed
    await updateAppointmentStatus(noteData.appointmentId, 'completed');

    return newNote;
  }, [sessionNotes, updateAppointmentStatus]);

  const updateSessionNote = useCallback(async (noteId: string, updates: Partial<SessionNote>) => {
    const updatedNotes = sessionNotes.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, updatedAt: Date.now() }
        : note
    );
    await saveSessionNotes(updatedNotes);
  }, [sessionNotes]);

  // Filtered data based on user role
  const userAppointments = useMemo(() => {
    if (!user) return [];
    
    switch (user.role) {
      case 'student':
        return appointments.filter(apt => apt.studentId === user.id);
      case 'counselor':
        return appointments.filter(apt => apt.counselorId === user.id);
      case 'admin':
        return appointments; // Admin can see all
      default:
        return [];
    }
  }, [appointments, user]);

  const userSessionNotes = useMemo(() => {
    if (!user) return [];
    
    switch (user.role) {
      case 'counselor':
        return sessionNotes.filter(note => note.counselorId === user.id);
      case 'admin':
        return sessionNotes; // Admin can see all (anonymized)
      default:
        return [];
    }
  }, [sessionNotes, user]);

  // Analytics data
  const appointmentStats = useMemo(() => {
    const total = userAppointments.length;
    const pending = userAppointments.filter(apt => apt.status === 'pending').length;
    const approved = userAppointments.filter(apt => apt.status === 'approved').length;
    const completed = userAppointments.filter(apt => apt.status === 'completed').length;
    const cancelled = userAppointments.filter(apt => apt.status === 'cancelled').length;
    
    const riskLevels = {
      minimal: userAppointments.filter(apt => apt.riskLevel === 'minimal').length,
      moderate: userAppointments.filter(apt => apt.riskLevel === 'moderate').length,
      high: userAppointments.filter(apt => apt.riskLevel === 'high').length
    };

    return {
      total,
      pending,
      approved,
      completed,
      cancelled,
      riskLevels
    };
  }, [userAppointments]);

  return {
    appointments: userAppointments,
    sessionNotes: userSessionNotes,
    appointmentStats,
    isLoading,
    bookAppointment,
    updateAppointmentStatus,
    addSessionNote,
    updateSessionNote
  };
});