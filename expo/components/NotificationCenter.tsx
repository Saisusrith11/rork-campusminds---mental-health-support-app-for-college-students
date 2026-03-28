import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, X, Check, CheckCheck, Trash2, Settings, AlertTriangle } from 'lucide-react-native';
import { useNotifications } from '@/hooks/notification-store';
import { useLanguage } from '@/hooks/language-store';
import { useAccessibility } from '@/hooks/accessibility-store';
import { useAuth } from '@/hooks/auth-store';

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ visible, onClose }: NotificationCenterProps) {
  const { } = useAuth();
  const {
    notifications,
    unreadCount,
    emergencyCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    settings,
    saveSettings,
  } = useNotifications();
  const { translate, formatDate } = useLanguage();
  const { 
    getAccessibilityProps, 
    announceForScreenReader, 
    getContrastColors,
    getFontSize 
  } = useAccessibility();

  const [filter, setFilter] = useState<'all' | 'unread' | 'emergency'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const colors = getContrastColors();

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    
    if (filter === 'unread') {
      filtered = notifications.filter(notif => !notif.read);
    } else if (filter === 'emergency') {
      filtered = notifications.filter(notif => notif.type === 'emergency');
    }
    
    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }, [notifications, filter]);

  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    await markAsRead(notificationId);
    await announceForScreenReader(translate('notification.marked_read', 'Notification marked as read'));
  }, [markAsRead, announceForScreenReader, translate]);

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
    await announceForScreenReader(translate('notification.all_marked_read', 'All notifications marked as read'));
  }, [markAllAsRead, announceForScreenReader, translate]);

  const handleDeleteNotification = useCallback(async (notificationId: string) => {
    // In a real app, you would show a custom modal instead of Alert
    await deleteNotification(notificationId);
    await announceForScreenReader(translate('notification.deleted', 'Notification deleted'));
  }, [deleteNotification, announceForScreenReader, translate]);

  const handleClearAll = useCallback(async () => {
    // In a real app, you would show a custom modal instead of Alert
    await clearAllNotifications();
    await announceForScreenReader(translate('notification.all_cleared', 'All notifications cleared'));
  }, [clearAllNotifications, announceForScreenReader, translate]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh - in real app, this would sync with server
    await new Promise((resolve) => {
      if (typeof resolve === 'function') {
        setTimeout(resolve, 1000);
      }
    });
    setRefreshing(false);
    await announceForScreenReader(translate('notification.refreshed', 'Notifications refreshed'));
  }, [announceForScreenReader, translate]);

  const getNotificationIcon = (type: string, priority: string) => {
    if (type === 'emergency' || priority === 'urgent') {
      return <AlertTriangle size={20} color={colors.error} />;
    }
    return <Bell size={20} color={colors.primary} />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return colors.error;
      case 'high': return '#FF6B35';
      case 'normal': return colors.primary;
      case 'low': return colors.secondary;
      default: return colors.text;
    }
  };

  const renderNotificationItem = (notification: any) => (
    <View
      key={notification.id}
      style={[
        styles.notificationItem,
        { 
          backgroundColor: notification.read ? colors.background : `${colors.primary}10`,
          borderLeftColor: getPriorityColor(notification.priority),
        }
      ]}
      {...getAccessibilityProps(
        `${notification.title}. ${notification.body}. ${notification.read ? 'Read' : 'Unread'}. ${formatDate(notification.timestamp)}`,
        'listitem',
        'Tap to mark as read or swipe for options'
      )}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIconContainer}>
          {getNotificationIcon(notification.type, notification.priority)}
        </View>
        <View style={styles.notificationContent}>
          <Text 
            style={[
              styles.notificationTitle, 
              { 
                color: colors.text,
                fontSize: getFontSize(16),
                fontWeight: notification.read ? 'normal' : 'bold',
              }
            ]}
            numberOfLines={2}
          >
            {notification.title}
          </Text>
          <Text 
            style={[
              styles.notificationBody, 
              { 
                color: colors.text,
                fontSize: getFontSize(14),
                opacity: 0.8,
              }
            ]}
            numberOfLines={3}
          >
            {notification.body}
          </Text>
          <Text 
            style={[
              styles.notificationTime, 
              { 
                color: colors.text,
                fontSize: getFontSize(12),
                opacity: 0.6,
              }
            ]}
          >
            {formatDate(notification.timestamp)}
          </Text>
        </View>
        <View style={styles.notificationActions}>
          {!notification.read && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => handleMarkAsRead(notification.id)}
              {...getAccessibilityProps('Mark as read', 'button')}
            >
              <Check size={16} color={colors.background} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={() => handleDeleteNotification(notification.id)}
            {...getAccessibilityProps('Delete notification', 'button')}
          >
            <Trash2 size={16} color={colors.background} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFilterButton = (filterType: 'all' | 'unread' | 'emergency', label: string, count?: number) => {
    if (!filterType?.trim()) return null;
    
    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: filter === filterType ? colors.primary : 'transparent',
            borderColor: colors.primary,
          }
        ]}
        onPress={() => setFilter(filterType)}
      {...getAccessibilityProps(
        `${label}${count !== undefined ? ` (${count})` : ''}`,
        'button',
        `Filter notifications by ${label.toLowerCase()}`
      )}
    >
      <Text
        style={[
          styles.filterButtonText,
          {
            color: filter === filterType ? colors.background : colors.primary,
            fontSize: getFontSize(14),
          }
        ]}
      >
        {label}
        {count !== undefined && count > 0 && (
          <Text style={styles.filterCount}> ({count})</Text>
        )}
      </Text>
      </TouchableOpacity>
    );
  };

  const renderNotificationSettings = () => (
    <Modal
      visible={showSettings}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowSettings(false)}
    >
      <SafeAreaView style={[styles.settingsContainer, { backgroundColor: colors.background }]}>
        <View style={styles.settingsHeader}>
          <Text style={[styles.settingsTitle, { color: colors.text, fontSize: getFontSize(20) }]}>
            {translate('notification.settings_title', 'Notification Settings')}
          </Text>
          <TouchableOpacity
            onPress={() => setShowSettings(false)}
            {...getAccessibilityProps('Close settings', 'button')}
          >
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.settingsContent}>
          {Object.entries(settings).map(([key, value]) => {
            if (typeof value === 'boolean') {
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.settingItem}
                  onPress={() => saveSettings({ ...settings, [key]: !value })}
                  {...getAccessibilityProps(
                    `${key.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${value ? 'enabled' : 'disabled'}`,
                    'switch',
                    'Tap to toggle'
                  )}
                >
                  <Text style={[styles.settingLabel, { color: colors.text, fontSize: getFontSize(16) }]}>
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </Text>
                  <View style={[
                    styles.switch,
                    { backgroundColor: value ? colors.primary : colors.border }
                  ]}>
                    <View style={[
                      styles.switchThumb,
                      { 
                        backgroundColor: colors.background,
                        transform: [{ translateX: value ? 20 : 2 }]
                      }
                    ]} />
                  </View>
                </TouchableOpacity>
              );
            }
            return null;
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Bell size={24} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text, fontSize: getFontSize(20) }]}>
              {translate('notification.title', 'Notifications')}
            </Text>
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.error }]}>
                <Text style={[styles.badgeText, { fontSize: getFontSize(12) }]}>
                  {unreadCount}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowSettings(true)}
              {...getAccessibilityProps('Notification settings', 'button')}
            >
              <Settings size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={onClose}
              {...getAccessibilityProps('Close notifications', 'button')}
            >
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          {renderFilterButton('all', translate('notification.filter_all', 'All'), notifications.length)}
          {renderFilterButton('unread', translate('notification.filter_unread', 'Unread'), unreadCount)}
          {renderFilterButton('emergency', translate('notification.filter_emergency', 'Emergency'), emergencyCount)}
        </View>

        {/* Actions */}
        {notifications.length > 0 && (
          <View style={styles.actionsContainer}>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={handleMarkAllAsRead}
                {...getAccessibilityProps('Mark all as read', 'button')}
              >
                <CheckCheck size={16} color={colors.background} />
                <Text style={[styles.actionButtonText, { color: colors.background, fontSize: getFontSize(14) }]}>
                  {translate('notification.mark_all_read', 'Mark All Read')}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.error }]}
              onPress={handleClearAll}
              {...getAccessibilityProps('Clear all notifications', 'button')}
            >
              <Trash2 size={16} color={colors.background} />
              <Text style={[styles.actionButtonText, { color: colors.background, fontSize: getFontSize(14) }]}>
                {translate('notification.clear_all', 'Clear All')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notifications List */}
        <ScrollView
          style={styles.notificationsList}
          {...getAccessibilityProps('Notifications list', 'list')}
        >
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Bell size={48} color={colors.text} />
              <Text style={[styles.emptyStateText, { color: colors.text, fontSize: getFontSize(16) }]}>
                {filter === 'all' 
                  ? translate('notification.no_notifications', 'No notifications yet')
                  : filter === 'unread'
                  ? translate('notification.no_unread', 'No unread notifications')
                  : translate('notification.no_emergency', 'No emergency notifications')
                }
              </Text>
            </View>
          ) : (
            filteredNotifications.map(renderNotificationItem)
          )}
        </ScrollView>

        {renderNotificationSettings()}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginLeft: 12,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontWeight: '500',
  },
  filterCount: {
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontWeight: '500',
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    marginHorizontal: 20,
    marginVertical: 4,
    borderRadius: 12,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  notificationHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  notificationIconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationBody: {
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontStyle: 'italic',
  },
  notificationActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
  settingsContainer: {
    flex: 1,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingsTitle: {
    fontWeight: 'bold',
  },
  settingsContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    flex: 1,
    textTransform: 'capitalize',
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});