import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './auth-store';

interface SecuritySettings {
  biometricEnabled: boolean;
  autoLockEnabled: boolean;
  autoLockTimeout: number; // in minutes
  dataEncryptionEnabled: boolean;
  sessionTimeout: number; // in minutes
  requirePinForSensitiveActions: boolean;
  allowScreenshots: boolean;
  logSecurityEvents: boolean;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'data_access' | 'settings_change' | 'suspicious_activity';
  timestamp: number;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAgent?: string;
  ipAddress?: string;
}

interface SessionData {
  sessionId: string;
  userId: string;
  startTime: number;
  lastActivity: number;
  isActive: boolean;
  deviceInfo: string;
}

const SECURITY_SETTINGS_KEY = 'campusminds_security_settings';
const SECURITY_EVENTS_KEY = 'campusminds_security_events';
const SESSION_DATA_KEY = 'campusminds_session_data';
const ENCRYPTION_KEY = 'campusminds_encryption_key';

// Secure storage wrapper that falls back to AsyncStorage on web
const secureStorage = {
  setItem: async (key: string, value: string) => {
    if (!key?.trim() || !value?.trim()) return;
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  getItem: async (key: string): Promise<string | null> => {
    if (!key?.trim()) return null;
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  deleteItem: async (key: string) => {
    if (!key?.trim()) return;
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export const [SecurityProvider, useSecurity] = createContextHook(() => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SecuritySettings>({
    biometricEnabled: false,
    autoLockEnabled: true,
    autoLockTimeout: 15, // 15 minutes
    dataEncryptionEnabled: true,
    sessionTimeout: 60, // 1 hour
    requirePinForSensitiveActions: true,
    allowScreenshots: false,
    logSecurityEvents: true,
  });
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSecuritySettings();
      loadSecurityEvents();
      initializeSession();
      startActivityMonitoring();
    }
  }, [user]);

  useEffect(() => {
    // Auto-lock functionality
    if (settings.autoLockEnabled && currentSession) {
      const checkAutoLock = setInterval(() => {
        const timeSinceLastActivity = Date.now() - lastActivity;
        const timeoutMs = settings.autoLockTimeout * 60 * 1000;
        
        if (timeSinceLastActivity > timeoutMs) {
          lockApp();
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(checkAutoLock);
    }
  }, [settings.autoLockEnabled, settings.autoLockTimeout, lastActivity, currentSession]);

  const loadSecuritySettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SECURITY_SETTINGS_KEY);
      if (stored && stored.trim()) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            setSettings({ ...settings, ...parsed });
          }
        } catch (parseError) {
          console.error('Failed to parse security settings:', parseError);
          await AsyncStorage.removeItem(SECURITY_SETTINGS_KEY);
          logSecurityEvent('settings_change', 'Failed to parse security settings', 'medium');
        }
      }
    } catch (error) {
      console.error('Failed to load security settings:', error);
      logSecurityEvent('settings_change', 'Failed to load security settings', 'medium');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSecurityEvents = async () => {
    try {
      const stored = await AsyncStorage.getItem(SECURITY_EVENTS_KEY);
      if (stored && stored.trim()) {
        try {
          const events = JSON.parse(stored);
          if (Array.isArray(events)) {
            // Keep only last 100 events and events from last 30 days
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            const filteredEvents = events
              .filter((event: SecurityEvent) => event && typeof event.timestamp === 'number' && event.timestamp > thirtyDaysAgo)
              .slice(0, 100);
            setSecurityEvents(filteredEvents);
          }
        } catch (parseError) {
          console.error('Failed to parse security events:', parseError);
          await AsyncStorage.removeItem(SECURITY_EVENTS_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to load security events:', error);
    }
  };

  const saveSecuritySettings = useCallback(async (newSettings: Partial<SecuritySettings>) => {
    if (!newSettings || typeof newSettings !== 'object') return;
    
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await AsyncStorage.setItem(SECURITY_SETTINGS_KEY, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      logSecurityEvent('settings_change', `Security settings updated: ${Object.keys(newSettings).join(', ')}`, 'low');
    } catch (error) {
      console.error('Failed to save security settings:', error);
      logSecurityEvent('settings_change', 'Failed to save security settings', 'medium');
    }
  }, [settings]);

  const logSecurityEvent = useCallback(async (
    type: SecurityEvent['type'],
    details: string,
    severity: SecurityEvent['severity'] = 'low'
  ) => {
    if (!settings.logSecurityEvents || !type?.trim() || !details?.trim()) return;

    const event: SecurityEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: Date.now(),
      details: details.substring(0, 500), // Limit details length
      severity,
      userAgent: Platform.OS,
      ipAddress: 'unknown', // Would be populated by backend in real app
    };

    try {
      const updatedEvents = [event, ...securityEvents].slice(0, 100);
      setSecurityEvents(updatedEvents);
      await AsyncStorage.setItem(SECURITY_EVENTS_KEY, JSON.stringify(updatedEvents));

      // Log critical events to console for debugging
      if (severity === 'critical' || severity === 'high') {
        console.warn(`Security Event [${severity.toUpperCase()}]:`, details);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [settings.logSecurityEvents, securityEvents]);

  const initializeSession = useCallback(async () => {
    if (!user) return;

    const sessionData: SessionData = {
      sessionId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      startTime: Date.now(),
      lastActivity: Date.now(),
      isActive: true,
      deviceInfo: `${Platform.OS} ${Platform.Version}`,
    };

    try {
      await secureStorage.setItem(SESSION_DATA_KEY, JSON.stringify(sessionData));
      setCurrentSession(sessionData);
      logSecurityEvent('login', `User logged in from ${sessionData.deviceInfo}`, 'low');
    } catch (error) {
      console.error('Failed to initialize session:', error);
      logSecurityEvent('login', 'Failed to initialize secure session', 'medium');
    }
  }, [user, logSecurityEvent]);

  const updateActivity = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);
    
    if (currentSession) {
      const updatedSession = { ...currentSession, lastActivity: now };
      setCurrentSession(updatedSession);
      secureStorage.setItem(SESSION_DATA_KEY, JSON.stringify(updatedSession));
    }
  }, [currentSession]);

  const startActivityMonitoring = useCallback(() => {
    // This would typically be integrated with navigation or touch events
    // For now, we'll update activity periodically
    const activityInterval = setInterval(() => {
      updateActivity();
    }, 60000); // Update every minute

    return () => clearInterval(activityInterval);
  }, [updateActivity]);

  const lockApp = useCallback(async () => {
    setIsLocked(true);
    if (currentSession) {
      const updatedSession = { ...currentSession, isActive: false };
      setCurrentSession(updatedSession);
      await secureStorage.setItem(SESSION_DATA_KEY, JSON.stringify(updatedSession));
    }
    logSecurityEvent('data_access', 'App locked due to inactivity', 'low');
  }, [currentSession, logSecurityEvent]);

  const unlockApp = useCallback(async (credentials?: { pin?: string; biometric?: boolean }) => {
    if (!credentials && settings.requirePinForSensitiveActions) {
      logSecurityEvent('failed_login', 'Unlock attempt without credentials', 'medium');
      return false;
    }

    try {
      setIsLocked(false);
      updateActivity();
      
      if (currentSession) {
        const updatedSession = { ...currentSession, isActive: true, lastActivity: Date.now() };
        setCurrentSession(updatedSession);
        await secureStorage.setItem(SESSION_DATA_KEY, JSON.stringify(updatedSession));
      }
      
      logSecurityEvent('login', 'App unlocked successfully', 'low');
      return true;
    } catch (error) {
      console.error('Failed to unlock app:', error);
      logSecurityEvent('failed_login', 'Failed to unlock app', 'medium');
      return false;
    }
  }, [settings.requirePinForSensitiveActions, currentSession, updateActivity, logSecurityEvent]);

  const endSession = useCallback(async () => {
    if (currentSession) {
      try {
        const updatedSession = { ...currentSession, isActive: false };
        await secureStorage.setItem(SESSION_DATA_KEY, JSON.stringify(updatedSession));
        setCurrentSession(null);
        logSecurityEvent('logout', 'User session ended', 'low');
      } catch (error) {
        console.error('Failed to end session:', error);
        logSecurityEvent('logout', 'Failed to end session properly', 'medium');
      }
    }
  }, [currentSession, logSecurityEvent]);

  // Encrypt sensitive data
  const encryptData = useCallback(async (data: string): Promise<string> => {
    if (!data?.trim()) return '';
    
    if (!settings.dataEncryptionEnabled) {
      return data;
    }

    try {
      // In a real app, you would use proper encryption libraries
      // For demo purposes, we'll use base64 encoding
      const encrypted = Buffer.from(data).toString('base64');
      return encrypted;
    } catch (error) {
      console.error('Failed to encrypt data:', error);
      logSecurityEvent('data_access', 'Data encryption failed', 'high');
      return data; // Return original data if encryption fails
    }
  }, [settings.dataEncryptionEnabled, logSecurityEvent]);

  // Decrypt sensitive data
  const decryptData = useCallback(async (encryptedData: string): Promise<string> => {
    if (!encryptedData?.trim()) return '';
    
    if (!settings.dataEncryptionEnabled) {
      return encryptedData;
    }

    try {
      // In a real app, you would use proper decryption
      const decrypted = Buffer.from(encryptedData, 'base64').toString();
      return decrypted;
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      logSecurityEvent('data_access', 'Data decryption failed', 'high');
      return encryptedData; // Return encrypted data if decryption fails
    }
  }, [settings.dataEncryptionEnabled, logSecurityEvent]);

  // Validate session integrity
  const validateSession = useCallback(async (): Promise<boolean> => {
    if (!currentSession || !user) return false;

    try {
      const storedSession = await secureStorage.getItem(SESSION_DATA_KEY);
      if (!storedSession || !storedSession.trim()) return false;

      let sessionData;
      try {
        sessionData = JSON.parse(storedSession);
      } catch (parseError) {
        console.error('Failed to parse session data:', parseError);
        logSecurityEvent('suspicious_activity', 'Invalid session data format', 'high');
        await endSession();
        return false;
      }
      
      // Check if session is expired
      const sessionAge = Date.now() - sessionData.startTime;
      const maxSessionAge = settings.sessionTimeout * 60 * 1000;
      
      if (sessionAge > maxSessionAge) {
        logSecurityEvent('suspicious_activity', 'Session expired', 'medium');
        await endSession();
        return false;
      }

      // Check if session belongs to current user
      if (sessionData.userId !== user.id) {
        logSecurityEvent('suspicious_activity', 'Session user mismatch', 'high');
        await endSession();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to validate session:', error);
      logSecurityEvent('suspicious_activity', 'Session validation failed', 'high');
      return false;
    }
  }, [currentSession, user, settings.sessionTimeout, endSession, logSecurityEvent]);

  // Clear all security data
  const clearSecurityData = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(SECURITY_SETTINGS_KEY);
      await AsyncStorage.removeItem(SECURITY_EVENTS_KEY);
      await secureStorage.deleteItem(SESSION_DATA_KEY);
      await secureStorage.deleteItem(ENCRYPTION_KEY);
      
      setSettings({
        biometricEnabled: false,
        autoLockEnabled: true,
        autoLockTimeout: 15,
        dataEncryptionEnabled: true,
        sessionTimeout: 60,
        requirePinForSensitiveActions: true,
        allowScreenshots: false,
        logSecurityEvents: true,
      });
      setSecurityEvents([]);
      setCurrentSession(null);
      setIsLocked(false);
      
      console.log('Security data cleared successfully');
    } catch (error) {
      console.error('Failed to clear security data:', error);
    }
  }, []);

  const getSecurityScore = useMemo(() => {
    let score = 0;
    const maxScore = 100;

    if (settings.biometricEnabled) score += 15;
    if (settings.autoLockEnabled) score += 15;
    if (settings.dataEncryptionEnabled) score += 20;
    if (settings.requirePinForSensitiveActions) score += 15;
    if (!settings.allowScreenshots) score += 10;
    if (settings.logSecurityEvents) score += 10;
    if (settings.autoLockTimeout <= 15) score += 10;
    if (settings.sessionTimeout <= 60) score += 5;

    return Math.min(score, maxScore);
  }, [settings]);

  const getRecentSecurityEvents = useMemo(() => {
    return securityEvents
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  }, [securityEvents]);

  const getCriticalEvents = useMemo(() => {
    return securityEvents.filter(event => 
      event.severity === 'critical' || event.severity === 'high'
    );
  }, [securityEvents]);

  return useMemo(() => ({
    settings,
    securityEvents,
    currentSession,
    isLocked,
    lastActivity,
    isLoading,
    securityScore: getSecurityScore,
    recentEvents: getRecentSecurityEvents,
    criticalEvents: getCriticalEvents,
    
    // Actions
    saveSecuritySettings,
    logSecurityEvent,
    lockApp,
    unlockApp,
    endSession,
    updateActivity,
    encryptData,
    decryptData,
    validateSession,
    clearSecurityData,
  }), [
    settings,
    securityEvents,
    currentSession,
    isLocked,
    lastActivity,
    isLoading,
    getSecurityScore,
    getRecentSecurityEvents,
    getCriticalEvents,
    saveSecuritySettings,
    logSecurityEvent,
    lockApp,
    unlockApp,
    endSession,
    updateActivity,
    encryptData,
    decryptData,
    validateSession,
    clearSecurityData,
  ]);
});