import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

interface AccessibilitySettings {
  screenReaderEnabled: boolean;
  highContrastEnabled: boolean;
  largeTextEnabled: boolean;
  reducedMotionEnabled: boolean;
  voiceOverEnabled: boolean;
  talkBackEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  colorScheme: 'light' | 'dark' | 'high-contrast';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  gestureNavigation: boolean;
  keyboardNavigation: boolean;
}

interface AccessibilityFeatures {
  announcements: boolean;
  semanticLabels: boolean;
  focusManagement: boolean;
  alternativeText: boolean;
  colorIndependentUI: boolean;
  keyboardSupport: boolean;
  gestureSupport: boolean;
  audioDescriptions: boolean;
}

interface AccessibilityAnnouncement {
  id: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
  announced: boolean;
}

const ACCESSIBILITY_SETTINGS_KEY = 'campusminds_accessibility_settings';
const ACCESSIBILITY_ANNOUNCEMENTS_KEY = 'campusminds_accessibility_announcements';

export const [AccessibilityProvider, useAccessibility] = createContextHook(() => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    screenReaderEnabled: false,
    highContrastEnabled: false,
    largeTextEnabled: false,
    reducedMotionEnabled: false,
    voiceOverEnabled: false,
    talkBackEnabled: false,
    fontSize: 'medium',
    colorScheme: 'light',
    soundEnabled: true,
    vibrationEnabled: true,
    gestureNavigation: true,
    keyboardNavigation: false,
  });

  const [features, setFeatures] = useState<AccessibilityFeatures>({
    announcements: true,
    semanticLabels: true,
    focusManagement: true,
    alternativeText: true,
    colorIndependentUI: true,
    keyboardSupport: true,
    gestureSupport: true,
    audioDescriptions: false,
  });

  const [announcements, setAnnouncements] = useState<AccessibilityAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [systemAccessibilityEnabled, setSystemAccessibilityEnabled] = useState(false);

  useEffect(() => {
    loadAccessibilitySettings();
    detectSystemAccessibilitySettings();
    setupAccessibilityListeners();
  }, []);

  const loadAccessibilitySettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(ACCESSIBILITY_SETTINGS_KEY);
      if (stored && stored.trim()) {
        try {
          const savedSettings = JSON.parse(stored);
          if (savedSettings && typeof savedSettings === 'object') {
            setSettings({ ...settings, ...savedSettings });
          }
        } catch (parseError) {
          console.error('Failed to parse accessibility settings:', parseError);
          await AsyncStorage.removeItem(ACCESSIBILITY_SETTINGS_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to load accessibility settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const detectSystemAccessibilitySettings = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web accessibility detection
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
        
        setSettings(prev => ({
          ...prev,
          reducedMotionEnabled: prefersReducedMotion,
          highContrastEnabled: prefersHighContrast,
        }));
      } else {
        // React Native accessibility detection
        const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
        const reduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        
        setSystemAccessibilityEnabled(screenReaderEnabled);
        
        setSettings(prev => ({
          ...prev,
          screenReaderEnabled,
          reducedMotionEnabled: reduceMotionEnabled,
          voiceOverEnabled: Platform.OS === 'ios' && screenReaderEnabled,
          talkBackEnabled: Platform.OS === 'android' && screenReaderEnabled,
        }));
      }
    } catch (error) {
      console.error('Failed to detect system accessibility settings:', error);
    }
  };

  const setupAccessibilityListeners = () => {
    if (Platform.OS !== 'web') {
      const screenReaderListener = AccessibilityInfo.addEventListener(
        'screenReaderChanged',
        (enabled) => {
          setSystemAccessibilityEnabled(enabled);
          setSettings(prev => ({
            ...prev,
            screenReaderEnabled: enabled,
            voiceOverEnabled: Platform.OS === 'ios' && enabled,
            talkBackEnabled: Platform.OS === 'android' && enabled,
          }));
        }
      );

      const reduceMotionListener = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        (enabled) => {
          setSettings(prev => ({
            ...prev,
            reducedMotionEnabled: enabled,
          }));
        }
      );

      return () => {
        screenReaderListener?.remove();
        reduceMotionListener?.remove();
      };
    }
  };

  const saveAccessibilitySettings = useCallback(async (newSettings: Partial<AccessibilitySettings>) => {
    if (!newSettings || typeof newSettings !== 'object') return;
    
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await AsyncStorage.setItem(ACCESSIBILITY_SETTINGS_KEY, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to save accessibility settings:', error);
    }
  }, [settings]);

  const announceForScreenReader = useCallback(async (
    message: string,
    priority: AccessibilityAnnouncement['priority'] = 'medium'
  ) => {
    if (!message?.trim() || !features.announcements) return;

    const announcement: AccessibilityAnnouncement = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: message.substring(0, 200), // Limit message length
      priority,
      timestamp: Date.now(),
      announced: false,
    };

    try {
      // Add to announcements queue
      setAnnouncements(prev => [announcement, ...prev.slice(0, 49)]); // Keep last 50

      // Announce to screen reader
      if (Platform.OS !== 'web' && (settings.screenReaderEnabled || systemAccessibilityEnabled)) {
        await AccessibilityInfo.announceForAccessibility(message);
        announcement.announced = true;
      }

      // Save announcements
      const updatedAnnouncements = [announcement, ...announcements.slice(0, 49)];
      await AsyncStorage.setItem(ACCESSIBILITY_ANNOUNCEMENTS_KEY, JSON.stringify(updatedAnnouncements));
    } catch (error) {
      console.error('Failed to announce for screen reader:', error);
    }
  }, [features.announcements, settings.screenReaderEnabled, systemAccessibilityEnabled, announcements]);

  const getFontSize = useCallback((baseSize: number): number => {
    if (typeof baseSize !== 'number' || baseSize <= 0) return 16;
    
    const multipliers = {
      'small': 0.875,
      'medium': 1,
      'large': 1.125,
      'extra-large': 1.25,
    };

    const multiplier = multipliers[settings.fontSize] || 1;
    return Math.round(baseSize * multiplier);
  }, [settings.fontSize]);

  const getContrastColors = useCallback(() => {
    if (settings.colorScheme === 'high-contrast') {
      return {
        background: '#000000',
        text: '#FFFFFF',
        primary: '#FFFF00',
        secondary: '#00FFFF',
        accent: '#FF00FF',
        border: '#FFFFFF',
        error: '#FF0000',
        success: '#00FF00',
        warning: '#FFFF00',
      };
    } else if (settings.colorScheme === 'dark') {
      return {
        background: '#121212',
        text: '#FFFFFF',
        primary: '#4A90E2',
        secondary: '#50C878',
        accent: '#9B59B6',
        border: '#333333',
        error: '#E74C3C',
        success: '#2ECC71',
        warning: '#F39C12',
      };
    } else {
      return {
        background: '#FFFFFF',
        text: '#000000',
        primary: '#4A90E2',
        secondary: '#50C878',
        accent: '#9B59B6',
        border: '#E0E0E0',
        error: '#E74C3C',
        success: '#2ECC71',
        warning: '#F39C12',
      };
    }
  }, [settings.colorScheme]);

  const getAccessibleTouchTarget = useCallback((minSize: number = 44): number => {
    // Ensure touch targets meet accessibility guidelines (minimum 44x44 points)
    return Math.max(minSize, 44);
  }, []);

  const generateAccessibilityLabel = useCallback((
    element: string,
    action?: string,
    state?: string,
    hint?: string
  ): string => {
    if (!element?.trim()) return '';
    
    let label = element.trim();
    
    if (action?.trim()) {
      label += `, ${action.trim()}`;
    }
    
    if (state?.trim()) {
      label += `, ${state.trim()}`;
    }
    
    if (hint?.trim()) {
      label += `. ${hint.trim()}`;
    }
    
    return label;
  }, []);

  const getSemanticRole = useCallback((elementType: string): string => {
    const roleMap: { [key: string]: string } = {
      'button': 'button',
      'link': 'link',
      'text': 'text',
      'heading': 'header',
      'input': 'textbox',
      'checkbox': 'checkbox',
      'radio': 'radio',
      'switch': 'switch',
      'slider': 'slider',
      'image': 'image',
      'list': 'list',
      'listitem': 'listitem',
      'tab': 'tab',
      'tablist': 'tablist',
      'menu': 'menu',
      'menuitem': 'menuitem',
      'alert': 'alert',
      'dialog': 'dialog',
    };

    return roleMap[elementType] || 'none';
  }, []);

  const shouldReduceMotion = useMemo(() => {
    return settings.reducedMotionEnabled;
  }, [settings.reducedMotionEnabled]);

  const shouldUseHighContrast = useMemo(() => {
    return settings.highContrastEnabled || settings.colorScheme === 'high-contrast';
  }, [settings.highContrastEnabled, settings.colorScheme]);

  const isScreenReaderActive = useMemo(() => {
    return settings.screenReaderEnabled || systemAccessibilityEnabled;
  }, [settings.screenReaderEnabled, systemAccessibilityEnabled]);

  const getAccessibilityProps = useCallback((
    label: string,
    role?: string,
    hint?: string,
    state?: { [key: string]: boolean | string }
  ) => {
    if (!features.semanticLabels) return {};

    const props: any = {
      accessible: true,
      accessibilityLabel: label?.trim() || undefined,
    };

    if (role?.trim()) {
      props.accessibilityRole = getSemanticRole(role);
    }

    if (hint?.trim()) {
      props.accessibilityHint = hint.trim();
    }

    if (state && typeof state === 'object') {
      props.accessibilityState = state;
    }

    return props;
  }, [features.semanticLabels, getSemanticRole]);

  const clearAccessibilityData = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(ACCESSIBILITY_SETTINGS_KEY);
      await AsyncStorage.removeItem(ACCESSIBILITY_ANNOUNCEMENTS_KEY);
      
      setSettings({
        screenReaderEnabled: false,
        highContrastEnabled: false,
        largeTextEnabled: false,
        reducedMotionEnabled: false,
        voiceOverEnabled: false,
        talkBackEnabled: false,
        fontSize: 'medium',
        colorScheme: 'light',
        soundEnabled: true,
        vibrationEnabled: true,
        gestureNavigation: true,
        keyboardNavigation: false,
      });
      
      setAnnouncements([]);
      console.log('Accessibility data cleared successfully');
    } catch (error) {
      console.error('Failed to clear accessibility data:', error);
    }
  }, []);

  const getAccessibilityScore = useMemo(() => {
    let score = 0;
    const maxScore = 100;

    if (features.announcements) score += 15;
    if (features.semanticLabels) score += 20;
    if (features.focusManagement) score += 15;
    if (features.alternativeText) score += 15;
    if (features.colorIndependentUI) score += 10;
    if (features.keyboardSupport) score += 10;
    if (features.gestureSupport) score += 10;
    if (settings.highContrastEnabled || shouldUseHighContrast) score += 5;

    return Math.min(score, maxScore);
  }, [features, settings.highContrastEnabled, shouldUseHighContrast]);

  return useMemo(() => ({
    settings,
    features,
    announcements,
    isLoading,
    systemAccessibilityEnabled,
    shouldReduceMotion,
    shouldUseHighContrast,
    isScreenReaderActive,
    accessibilityScore: getAccessibilityScore,
    
    // Actions
    saveAccessibilitySettings,
    announceForScreenReader,
    
    // Utilities
    getFontSize,
    getContrastColors,
    getAccessibleTouchTarget,
    generateAccessibilityLabel,
    getSemanticRole,
    getAccessibilityProps,
    clearAccessibilityData,
  }), [
    settings,
    features,
    announcements,
    isLoading,
    systemAccessibilityEnabled,
    shouldReduceMotion,
    shouldUseHighContrast,
    isScreenReaderActive,
    getAccessibilityScore,
    saveAccessibilitySettings,
    announceForScreenReader,
    getFontSize,
    getContrastColors,
    getAccessibleTouchTarget,
    generateAccessibilityLabel,
    getSemanticRole,
    getAccessibilityProps,
    clearAccessibilityData,
  ]);
});