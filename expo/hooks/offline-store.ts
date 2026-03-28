import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState, useCallback, useMemo } from 'react';

interface OfflineData {
  assessments: any[];
  resources: any[];
  activities: any[];
  messages: any[];
  appointments: any[];
  emergencyContacts: any[];
  lastSync: number;
}

interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: number;
  pendingSync: boolean;
  syncErrors: string[];
}

const OFFLINE_STORAGE_KEY = 'campusminds_offline_data';
const SYNC_STATUS_KEY = 'campusminds_sync_status';

export const [OfflineProvider, useOffline] = createContextHook(() => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    assessments: [],
    resources: [],
    activities: [],
    messages: [],
    appointments: [],
    emergencyContacts: [],
    lastSync: 0,
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    lastSyncTime: 0,
    pendingSync: false,
    syncErrors: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOfflineData();
    loadSyncStatus();
    
    // Monitor network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online || false);
      setSyncStatus(prev => ({ ...prev, isOnline: online || false }));
      
      // Auto-sync when coming back online
      if (online && !syncStatus.isOnline && syncStatus.pendingSync) {
        syncData();
      }
    });

    return () => unsubscribe();
  }, []);

  const loadOfflineData = async () => {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_STORAGE_KEY);
      if (stored && stored.trim()) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            setOfflineData({
              assessments: Array.isArray(parsed.assessments) ? parsed.assessments : [],
              resources: Array.isArray(parsed.resources) ? parsed.resources : [],
              activities: Array.isArray(parsed.activities) ? parsed.activities : [],
              messages: Array.isArray(parsed.messages) ? parsed.messages : [],
              appointments: Array.isArray(parsed.appointments) ? parsed.appointments : [],
              emergencyContacts: Array.isArray(parsed.emergencyContacts) ? parsed.emergencyContacts : [],
              lastSync: typeof parsed.lastSync === 'number' ? parsed.lastSync : 0,
            });
          }
        } catch (parseError) {
          console.error('Failed to parse offline data, clearing storage:', parseError);
          await AsyncStorage.removeItem(OFFLINE_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSyncStatus = async () => {
    try {
      const stored = await AsyncStorage.getItem(SYNC_STATUS_KEY);
      if (stored && stored.trim()) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            setSyncStatus(prev => ({ ...prev, ...parsed }));
          }
        } catch (parseError) {
          console.error('Failed to parse sync status, clearing storage:', parseError);
          await AsyncStorage.removeItem(SYNC_STATUS_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  const saveOfflineData = useCallback(async (data: OfflineData) => {
    if (!data || typeof data !== 'object') return;
    try {
      await AsyncStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(data));
      setOfflineData(data);
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }, []);

  const saveSyncStatus = useCallback(async (status: Partial<SyncStatus>) => {
    if (!status || typeof status !== 'object') return;
    try {
      const newStatus = { ...syncStatus, ...status };
      await AsyncStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(newStatus));
      setSyncStatus(newStatus);
    } catch (error) {
      console.error('Failed to save sync status:', error);
    }
  }, [syncStatus]);

  // Cache data for offline use
  const cacheAssessment = useCallback(async (assessment: any) => {
    if (!assessment || !assessment.id) return;
    const updatedData = {
      ...offlineData,
      assessments: [...offlineData.assessments.filter(a => a.id !== assessment.id), assessment],
    };
    await saveOfflineData(updatedData);
  }, [offlineData, saveOfflineData]);

  const cacheResource = useCallback(async (resource: any) => {
    if (!resource || !resource.id) return;
    const updatedData = {
      ...offlineData,
      resources: [...offlineData.resources.filter(r => r.id !== resource.id), resource],
    };
    await saveOfflineData(updatedData);
  }, [offlineData, saveOfflineData]);

  const cacheActivity = useCallback(async (activity: any) => {
    if (!activity || !activity.id) return;
    const updatedData = {
      ...offlineData,
      activities: [...offlineData.activities.filter(a => a.id !== activity.id), activity],
    };
    await saveOfflineData(updatedData);
  }, [offlineData, saveOfflineData]);

  const cacheMessage = useCallback(async (message: any) => {
    if (!message || !message.id) return;
    const updatedData = {
      ...offlineData,
      messages: [...offlineData.messages.filter(m => m.id !== message.id), message],
    };
    await saveOfflineData(updatedData);
  }, [offlineData, saveOfflineData]);

  const cacheAppointment = useCallback(async (appointment: any) => {
    if (!appointment || !appointment.id) return;
    const updatedData = {
      ...offlineData,
      appointments: [...offlineData.appointments.filter(a => a.id !== appointment.id), appointment],
    };
    await saveOfflineData(updatedData);
  }, [offlineData, saveOfflineData]);

  const cacheEmergencyContacts = useCallback(async (contacts: any[]) => {
    if (!Array.isArray(contacts)) return;
    const updatedData = {
      ...offlineData,
      emergencyContacts: contacts,
    };
    await saveOfflineData(updatedData);
  }, [offlineData, saveOfflineData]);

  // Sync data when online
  const syncData = useCallback(async () => {
    if (!isOnline) {
      await saveSyncStatus({ pendingSync: true });
      return;
    }

    try {
      await saveSyncStatus({ pendingSync: true, syncErrors: [] });

      // Here you would implement actual API calls to sync data
      // For now, we'll simulate the sync process
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedData = {
        ...offlineData,
        lastSync: Date.now(),
      };

      await saveOfflineData(updatedData);
      await saveSyncStatus({
        lastSyncTime: Date.now(),
        pendingSync: false,
        syncErrors: [],
      });

      console.log('Data synced successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      await saveSyncStatus({
        pendingSync: false,
        syncErrors: [error instanceof Error ? error.message : 'Unknown sync error'],
      });
    }
  }, [isOnline, offlineData, saveOfflineData, saveSyncStatus]);

  // Get cached data
  const getCachedAssessments = useCallback(() => {
    return offlineData.assessments || [];
  }, [offlineData.assessments]);

  const getCachedResources = useCallback(() => {
    return offlineData.resources || [];
  }, [offlineData.resources]);

  const getCachedActivities = useCallback(() => {
    return offlineData.activities || [];
  }, [offlineData.activities]);

  const getCachedMessages = useCallback(() => {
    return offlineData.messages || [];
  }, [offlineData.messages]);

  const getCachedAppointments = useCallback(() => {
    return offlineData.appointments || [];
  }, [offlineData.appointments]);

  const getCachedEmergencyContacts = useCallback(() => {
    return offlineData.emergencyContacts || [];
  }, [offlineData.emergencyContacts]);

  // Clear offline data
  const clearOfflineData = useCallback(async () => {
    const emptyData: OfflineData = {
      assessments: [],
      resources: [],
      activities: [],
      messages: [],
      appointments: [],
      emergencyContacts: [],
      lastSync: 0,
    };
    await saveOfflineData(emptyData);
  }, [saveOfflineData]);

  // Check if data is available offline
  const isDataAvailableOffline = useCallback((dataType: keyof OfflineData) => {
    if (dataType === 'lastSync') return true;
    return Array.isArray(offlineData[dataType]) && offlineData[dataType].length > 0;
  }, [offlineData]);

  const lastSyncFormatted = useMemo(() => {
    if (!syncStatus.lastSyncTime) return 'Never';
    const date = new Date(syncStatus.lastSyncTime);
    return date.toLocaleString();
  }, [syncStatus.lastSyncTime]);

  const canUseOffline = useMemo(() => {
    return !isOnline && (
      offlineData.resources.length > 0 ||
      offlineData.activities.length > 0 ||
      offlineData.emergencyContacts.length > 0
    );
  }, [isOnline, offlineData]);

  return useMemo(() => ({
    isOnline,
    offlineData,
    syncStatus,
    isLoading,
    canUseOffline,
    lastSyncFormatted,
    
    // Cache functions
    cacheAssessment,
    cacheResource,
    cacheActivity,
    cacheMessage,
    cacheAppointment,
    cacheEmergencyContacts,
    
    // Get cached data
    getCachedAssessments,
    getCachedResources,
    getCachedActivities,
    getCachedMessages,
    getCachedAppointments,
    getCachedEmergencyContacts,
    
    // Utility functions
    syncData,
    clearOfflineData,
    isDataAvailableOffline,
  }), [
    isOnline,
    offlineData,
    syncStatus,
    isLoading,
    canUseOffline,
    lastSyncFormatted,
    cacheAssessment,
    cacheResource,
    cacheActivity,
    cacheMessage,
    cacheAppointment,
    cacheEmergencyContacts,
    getCachedAssessments,
    getCachedResources,
    getCachedActivities,
    getCachedMessages,
    getCachedAppointments,
    getCachedEmergencyContacts,
    syncData,
    clearOfflineData,
    isDataAvailableOffline,
  ]);
});