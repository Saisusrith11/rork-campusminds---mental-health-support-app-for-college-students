import createContextHook from '@nkzw/create-context-hook';
import { Platform } from 'react-native';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './auth-store';

// Conditional imports for notifications - only import if not in Expo Go
let Notifications: any = null;
let Device: any = null;
let Constants: any = null;

// Check if we're in Expo Go environment
const isExpoGo = typeof __DEV__ !== 'undefined' && __DEV__ && Platform.OS !== 'web';

if (!isExpoGo && Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
    Device = require('expo-device');
    Constants = require('expo-constants');
  } catch (error: any) {
    console.log('Notifications not available in this environment:', error?.message || 'Unknown error');
  }
}

interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: number;
  read: boolean;
  type: 'appointment' | 'message' | 'assessment' | 'emergency' | 'system';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  userRole?: string;
}

interface NotificationSettings {
  enabled: boolean;
  appointments: boolean;
  messages: boolean;
  assessments: boolean;
  emergency: boolean;
  system: boolean;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
}

const STORAGE_KEY = 'campusminds_notifications';
const SETTINGS_KEY = 'campusminds_notification_settings';

// Configure notification behavior
if (Platform.OS !== 'web' && Notifications && !isExpoGo) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async (notification: any) => {
        const priority = notification.request.content.data?.priority || 'normal';
        return {
          shouldShowAlert: true,
          shouldPlaySound: priority === 'urgent' || priority === 'high',
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        };
      },
    });
  } catch (error: any) {
    console.log('Failed to configure notification handler:', error?.message || 'Unknown error');
  }
}

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    appointments: true,
    messages: true,
    assessments: true,
    emergency: true,
    system: true,
    sound: true,
    vibration: true,
    badge: true,
  });
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const notificationListener = useRef<any>(undefined);
  const responseListener = useRef<any>(undefined);

  const saveNotifications = useCallback(async (notifs: NotificationData[]) => {
    if (!Array.isArray(notifs)) return;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored && stored.trim()) {
        try {
          const parsedNotifications = JSON.parse(stored);
          if (Array.isArray(parsedNotifications)) {
            // Filter notifications for current user and last 30 days
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            const filteredNotifications = parsedNotifications.filter(
              (notif: NotificationData) => 
                notif && 
                typeof notif.timestamp === 'number' &&
                notif.timestamp > thirtyDaysAgo && 
                (!notif.userRole || notif.userRole === user?.role)
            );
            setNotifications(filteredNotifications);
          }
        } catch (parseError) {
          console.error('Failed to parse notifications, clearing storage:', parseError);
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.role]);

  const loadSettings = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored && stored.trim()) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            setSettings({
              enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : true,
              appointments: typeof parsed.appointments === 'boolean' ? parsed.appointments : true,
              messages: typeof parsed.messages === 'boolean' ? parsed.messages : true,
              assessments: typeof parsed.assessments === 'boolean' ? parsed.assessments : true,
              emergency: typeof parsed.emergency === 'boolean' ? parsed.emergency : true,
              system: typeof parsed.system === 'boolean' ? parsed.system : true,
              sound: typeof parsed.sound === 'boolean' ? parsed.sound : true,
              vibration: typeof parsed.vibration === 'boolean' ? parsed.vibration : true,
              badge: typeof parsed.badge === 'boolean' ? parsed.badge : true,
            });
          }
        } catch (parseError) {
          console.error('Failed to parse notification settings, clearing storage:', parseError);
          await AsyncStorage.removeItem(SETTINGS_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: NotificationSettings) => {
    if (!newSettings || typeof newSettings !== 'object') return;
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }, []);

  const registerForPushNotificationsAsync = useCallback(async () => {
    if (Platform.OS === 'web' || isExpoGo || !Notifications || !Device) {
      console.log('Push notifications not available in this environment');
      return;
    }

    try {
      let token;
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          console.log('Failed to get push token for push notification!');
          return;
        }
        try {
          token = (await Notifications.getExpoPushTokenAsync({
            projectId: Constants?.expoConfig?.extra?.eas?.projectId,
          })).data;
          console.log('Expo push token:', token);
        } catch (error) {
          console.log('Error getting push token:', error);
        }
      } else {
        console.log('Must use physical device for Push Notifications');
      }

      if (Platform.OS === 'android' && Notifications) {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });

        // Create channels for different notification types
        await Notifications.setNotificationChannelAsync('emergency', {
          name: 'Emergency Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF0000',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('appointments', {
          name: 'Appointment Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4A90E2',
        });

        await Notifications.setNotificationChannelAsync('messages', {
          name: 'Messages',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250],
          lightColor: '#50C878',
        });
      }

      if (token) {
        setExpoPushToken(token);
      }
    } catch (error: any) {
      console.log('Failed to register for push notifications:', error?.message || 'Unknown error');
    }
  }, []);

  const addNotification = useCallback(async (notification: NotificationData) => {
    if (!notification.title?.trim() || !notification.body?.trim()) return;
    const updatedNotifications = [notification, ...notifications];
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!notificationId?.trim()) return;
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  useEffect(() => {
    const initializeNotifications = async () => {
      if (user) {
        await loadNotifications();
        await loadSettings();
        if (Platform.OS !== 'web') {
          await registerForPushNotificationsAsync();
        }
      }
    };

    initializeNotifications();

    if (Platform.OS !== 'web' && Notifications && !isExpoGo) {
      try {
        // Listen for incoming notifications
        notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
          const notificationData: NotificationData = {
            id: notification.request.identifier,
            title: notification.request.content.title || '',
            body: notification.request.content.body || '',
            data: notification.request.content.data,
            timestamp: Date.now(),
            read: false,
            type: (notification.request.content.data?.type as NotificationData['type']) || 'system',
            priority: (notification.request.content.data?.priority as NotificationData['priority']) || 'normal',
            userRole: notification.request.content.data?.userRole as string | undefined,
          };
          addNotification(notificationData);
        });

        // Listen for notification responses
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
          const notificationId = response.notification.request.identifier;
          markAsRead(notificationId);
        });
      } catch (error: any) {
        console.log('Failed to set up notification listeners:', error?.message || 'Unknown error');
      }
    }

    return () => {
      if (Notifications && notificationListener.current) {
        try {
          Notifications.removeNotificationSubscription(notificationListener.current);
        } catch (error: any) {
          console.log('Failed to remove notification listener:', error?.message || 'Unknown error');
        }
      }
      if (Notifications && responseListener.current) {
        try {
          Notifications.removeNotificationSubscription(responseListener.current);
        } catch (error: any) {
          console.log('Failed to remove response listener:', error?.message || 'Unknown error');
        }
      }
    };
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!notificationId?.trim()) return;
    const updatedNotifications = notifications.filter(notif => notif.id !== notificationId);
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  const clearAllNotifications = useCallback(async () => {
    setNotifications([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const scheduleLocalNotification = useCallback(async (
    title: string,
    body: string,
    data: any = {},
    trigger: any = null
  ) => {
    if (Platform.OS === 'web' || isExpoGo || !Notifications) {
      console.log('Local notifications not available in this environment');
      // In Expo Go, just add to local notification list for UI purposes
      const notification: NotificationData = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        body,
        data,
        timestamp: Date.now(),
        read: false,
        type: data.type || 'system',
        priority: data.priority || 'normal',
        userRole: user?.role,
      };
      await addNotification(notification);
      return notification.id;
    }

    if (!settings.enabled) return;

    const notificationType = data.type || 'system';
    if (!settings[notificationType as keyof NotificationSettings]) return;

    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            ...data,
            userRole: user?.role,
          },
          sound: settings.sound ? 'default' : undefined,
        },
        trigger,
      });

      // Add to local notifications list
      const notification: NotificationData = {
        id: identifier,
        title,
        body,
        data,
        timestamp: Date.now(),
        read: false,
        type: notificationType,
        priority: data.priority || 'normal',
        userRole: user?.role,
      };
      await addNotification(notification);

      return identifier;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      // Fallback: add to local list anyway
      const notification: NotificationData = {
        id: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        body,
        data,
        timestamp: Date.now(),
        read: false,
        type: data.type || 'system',
        priority: data.priority || 'normal',
        userRole: user?.role,
      };
      await addNotification(notification);
      return notification.id;
    }
  }, [settings, user, addNotification]);

  // Role-specific notification helpers
  const sendAppointmentReminder = useCallback(async (appointmentData: any) => {
    if (Platform.OS === 'web') return;
    
    let trigger = null;
    if (Notifications && !isExpoGo) {
      try {
        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: appointmentData.reminderTime || 3600, // 1 hour before
          repeats: false,
        };
      } catch (error: any) {
        console.log('Failed to create trigger, using immediate notification');
      }
    }
    
    return scheduleLocalNotification(
      'Appointment Reminder',
      `You have an appointment with ${appointmentData.counselorName} in 1 hour`,
      {
        type: 'appointment',
        priority: 'high',
        appointmentId: appointmentData.id,
      },
      trigger
    );
  }, [scheduleLocalNotification]);

  const sendMessageNotification = useCallback(async (messageData: any) => {
    return scheduleLocalNotification(
      `New message from ${messageData.senderName}`,
      messageData.preview,
      {
        type: 'message',
        priority: 'normal',
        chatId: messageData.chatId,
        senderId: messageData.senderId,
      }
    );
  }, [scheduleLocalNotification]);

  const sendEmergencyAlert = useCallback(async (alertData: any) => {
    return scheduleLocalNotification(
      'Emergency Alert',
      alertData.message,
      {
        type: 'emergency',
        priority: 'urgent',
        alertId: alertData.id,
      }
    );
  }, [scheduleLocalNotification]);

  const sendAssessmentReminder = useCallback(async () => {
    return scheduleLocalNotification(
      'Mental Health Check-in',
      'Take a moment to check in with yourself today',
      {
        type: 'assessment',
        priority: 'normal',
      }
    );
  }, [scheduleLocalNotification]);

  const unreadCount = useMemo(() => {
    return notifications.filter(notif => !notif.read).length;
  }, [notifications]);
  
  const emergencyCount = useMemo(() => {
    return notifications.filter(notif => !notif.read && notif.type === 'emergency').length;
  }, [notifications]);

  const contextValue = useMemo(() => ({
    notifications,
    settings,
    expoPushToken,
    isLoading,
    unreadCount,
    emergencyCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    saveSettings,
    scheduleLocalNotification,
    sendAppointmentReminder,
    sendMessageNotification,
    sendEmergencyAlert,
    sendAssessmentReminder,
  }), [
    notifications,
    settings,
    expoPushToken,
    isLoading,
    unreadCount,
    emergencyCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    saveSettings,
    scheduleLocalNotification,
    sendAppointmentReminder,
    sendMessageNotification,
    sendEmergencyAlert,
    sendAssessmentReminder,
  ]);

  return contextValue;
});