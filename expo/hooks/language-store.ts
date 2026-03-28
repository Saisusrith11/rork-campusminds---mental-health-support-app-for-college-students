import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, useMemo } from 'react';

export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'te';

interface LanguageData {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  rtl: boolean;
  flag: string;
}

interface TranslationData {
  [key: string]: {
    [lang in SupportedLanguage]: string;
  };
}

const LANGUAGE_STORAGE_KEY = 'campusminds_language';

const supportedLanguages: LanguageData[] = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false, flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', rtl: false, flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', rtl: false, flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', rtl: false, flag: '🇮🇳' },
];

// Comprehensive translations for the mental health app
const translations: TranslationData = {
  // Navigation & General
  'nav.home': {
    en: 'Home',
    hi: 'होम',
    ta: 'முகப்பு',
    te: 'హోమ్'
  },
  'nav.chat': {
    en: 'Chat',
    hi: 'चैट',
    ta: 'அரட்டை',
    te: 'చాట్'
  },
  'nav.resources': {
    en: 'Resources',
    hi: 'संसाधन',
    ta: 'வளங்கள்',
    te: 'వనరులు'
  },
  'nav.profile': {
    en: 'Profile',
    hi: 'प्रोफ़ाइल',
    ta: 'சுயவிவரம்',
    te: 'ప్రొఫైల్'
  },
  'nav.community': {
    en: 'Community',
    hi: 'समुदाय',
    ta: 'சமூகம்',
    te: 'కమ్యూనిటీ'
  },

  // Chat Interface
  'chat.student.title': {
    en: 'Support Chat',
    hi: 'सहायता चैट',
    ta: 'ஆதரவு அரட்டை',
    te: 'మద్దతు చాట్'
  },
  'chat.counselor.title': {
    en: 'Student Sessions',
    hi: 'छात्र सत्र',
    ta: 'மாணவர் அமர்வுகள்',
    te: 'విద్యార్థి సెషన్లు'
  },
  'chat.volunteer.title': {
    en: 'Peer Support',
    hi: 'साथी सहायता',
    ta: 'சக ஆதரவு',
    te: 'పీర్ మద్దతు'
  },
  'chat.student.subtitle': {
    en: 'Connect with counselors and volunteers',
    hi: 'परामर्शदाताओं और स्वयंसेवकों से जुड़ें',
    ta: 'ஆலோசகர்கள் மற்றும் தன்னார்வலர்களுடன் இணைக்கவும்',
    te: 'కౌన్సెలర్లు మరియు వాలంటీర్లతో కనెక్ట్ అవ్వండి'
  },
  'chat.counselor.subtitle': {
    en: 'Chat with your assigned students',
    hi: 'अपने निर्दिष्ट छात्रों के साथ चैट करें',
    ta: 'உங்களுக்கு ஒதுக்கப்பட்ட மாணவர்களுடன் அரட்டையடிக்கவும்',
    te: 'మీకు కేటాయించిన విద్యార్థులతో చాట్ చేయండి'
  },
  'chat.volunteer.subtitle': {
    en: 'Support students who need help',
    hi: 'उन छात्रों की सहायता करें जिन्हें मदद की आवश्यकता है',
    ta: 'உதவி தேவைப்படும் மாணவர்களுக்கு ஆதரவளிக்கவும்',
    te: 'సహాయం అవసరమైన విద్యార్థులకు మద్దతు ఇవ్వండి'
  },
  'chat.empty.title': {
    en: 'No active chats',
    hi: 'कोई सक्रिय चैट नहीं',
    ta: 'செயலில் உள்ள அரட்டைகள் இல்லை',
    te: 'చురుకైన చాట్‌లు లేవు'
  },
  'chat.empty.student': {
    en: 'Start a conversation with a counselor or volunteer',
    hi: 'किसी परामर्शदाता या स्वयंसेवक के साथ बातचीत शुरू करें',
    ta: 'ஆலோசகர் அல்லது தன்னார்வலருடன் உரையாடலைத் தொடங்கவும்',
    te: 'కౌన్సెలర్ లేదా వాలంటీర్‌తో సంభాషణ ప్రారంభించండి'
  },
  'chat.empty.helper': {
    en: 'Students will appear here when they need support',
    hi: 'जब छात्रों को सहायता की आवश्यकता होगी तो वे यहां दिखाई देंगे',
    ta: 'மாணவர்களுக்கு ஆதரவு தேவைப்படும்போது அவர்கள் இங்கே தோன்றுவார்கள்',
    te: 'విద్యార్థులకు మద్దతు అవసరమైనప్పుడు వారు ఇక్కడ కనిపిస్తారు'
  },
  'chat.start': {
    en: 'Start New Chat',
    hi: 'नई चैट शुरू करें',
    ta: 'புதிய அரட்டையைத் தொடங்கவும்',
    te: 'కొత్త చాట్ ప్రారంభించండి'
  },
  'chat.anonymous': {
    en: 'Anonymous Student',
    hi: 'गुमनाम छात्र',
    ta: 'அநாமதேய மாணவர்',
    te: 'అనామక విద్యార్థి'
  },
  'risk.high': {
    en: 'high',
    hi: 'उच्च',
    ta: 'உயர்',
    te: 'అధిక'
  },
  'risk.moderate': {
    en: 'moderate',
    hi: 'मध्यम',
    ta: 'மிதமான',
    te: 'మధ్యస్థ'
  },
  'risk.minimal': {
    en: 'minimal',
    hi: 'न्यूनतम',
    ta: 'குறைந்தபட்ச',
    te: 'కనిష్ట'
  },
  'risk.level': {
    en: 'risk',
    hi: 'जोखिम',
    ta: 'ஆபத்து',
    te: 'ప్రమాదం'
  },

  // Settings
  'settings.language': {
    en: 'Language',
    hi: 'भाषा',
    ta: 'மொழி',
    te: 'భాష'
  },
  'settings.selectLanguage': {
    en: 'Select Language',
    hi: 'भाषा चुनें',
    ta: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    te: 'భాషను ఎంచుకోండి'
  },
  'settings.notifications': {
    en: 'Notifications',
    hi: 'सूचनाएं',
    ta: 'அறிவிப்புகள்',
    te: 'నోటిఫికేషన్లు'
  },
  'settings.privacy': {
    en: 'Privacy & Safety',
    hi: 'गोपनीयता और सुरक्षा',
    ta: 'தனியுரிமை மற்றும் பாதுகாப்பு',
    te: 'గోప్యత మరియు భద్రత'
  },
  'settings.bookingHistory': {
    en: 'Booking History',
    hi: 'बुकिंग इतिहास',
    ta: 'முன்பதிவு வரலாறு',
    te: 'బుకింగ్ చరిత్ర'
  },
  'settings.logout': {
    en: 'Logout',
    hi: 'लॉग आउट',
    ta: 'வெளியேறு',
    te: 'లాగ్ అవుట్'
  },

  // Mood Tracking
  'mood.title': {
    en: 'How is your day today?',
    hi: 'आज आपका दिन कैसा है?',
    ta: 'இன்று உங்கள் நாள் எப்படி?',
    te: 'ఈరోజు మీ రోజు ఎలా ఉంది?'
  },
  'mood.veryHappy': {
    en: 'Very Happy',
    hi: 'बहुत खुश',
    ta: 'மிகவும் மகிழ்ச்சி',
    te: 'చాలా సంతోషం'
  },
  'mood.happy': {
    en: 'Happy',
    hi: 'खुश',
    ta: 'மகிழ்ச்சி',
    te: 'సంతోషం'
  },
  'mood.neutral': {
    en: 'Neutral',
    hi: 'तटस्थ',
    ta: 'நடுநிலை',
    te: 'తటస్థ'
  },
  'mood.sad': {
    en: 'Sad',
    hi: 'उदास',
    ta: 'சோகம்',
    te: 'దుఃఖం'
  },
  'mood.verySad': {
    en: 'Very Sad',
    hi: 'बहुत उदास',
    ta: 'மிகவும் சோகம்',
    te: 'చాలా దుఃఖం'
  },

  // Buttons & Actions
  'button.continue': {
    en: 'Continue',
    hi: 'जारी रखें',
    ta: 'தொடரவும்',
    te: 'కొనసాగించు'
  },
  'button.cancel': {
    en: 'Cancel',
    hi: 'रद्द करें',
    ta: 'ரத்து செய்',
    te: 'రద్దు చేయి'
  },
  'button.save': {
    en: 'Save',
    hi: 'सेव करें',
    ta: 'சேமி',
    te: 'సేవ్ చేయి'
  },
  'button.submit': {
    en: 'Submit',
    hi: 'जमा करें',
    ta: 'சமர்ப்பிக்கவும்',
    te: 'సమర్పించు'
  },

  // Status Messages
  'status.loading': {
    en: 'Loading...',
    hi: 'लोड हो रहा है...',
    ta: 'ஏற்றுகிறது...',
    te: 'లోడ్ అవుతోంది...'
  },
};

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved && saved.trim()) {
        const languageCode = saved.trim();
        if (supportedLanguages.find(lang => lang.code === languageCode)) {
          setCurrentLanguage(languageCode as SupportedLanguage);
        }
      }
    } catch (error) {
      console.error('Failed to load saved language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = useCallback(async (languageCode: SupportedLanguage) => {
    if (!languageCode?.trim()) return;
    if (!supportedLanguages.find(lang => lang.code === languageCode)) return;
    
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
      setCurrentLanguage(languageCode);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  }, []);

  const translate = useCallback((key: string, fallback?: string): string => {
    if (!key?.trim()) return fallback || '';
    
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return fallback || key;
    }

    return translation[currentLanguage] || translation.en || fallback || key;
  }, [currentLanguage]);

  const getCurrentLanguageData = useCallback((): LanguageData => {
    return supportedLanguages.find(lang => lang.code === currentLanguage) || supportedLanguages[0];
  }, [currentLanguage]);

  const isRTL = useMemo(() => {
    return getCurrentLanguageData().rtl;
  }, [getCurrentLanguageData]);

  const getAvailableLanguages = useCallback(() => {
    return supportedLanguages;
  }, []);

  // Helper function for pluralization (basic implementation)
  const translatePlural = useCallback((
    key: string, 
    count: number, 
    fallback?: string
  ): string => {
    if (!key?.trim()) return fallback || '';
    
    const pluralKey = count === 1 ? key : `${key}.plural`;
    return translate(pluralKey, fallback);
  }, [translate]);

  // Format numbers according to language locale
  const formatNumber = useCallback((number: number): string => {
    if (typeof number !== 'number') return '0';
    
    const locale = currentLanguage === 'en' ? 'en-US' : 
                   currentLanguage === 'hi' ? 'hi-IN' :
                   currentLanguage === 'ta' ? 'ta-IN' :
                   currentLanguage === 'te' ? 'te-IN' :
                   'en-US';
    
    return new Intl.NumberFormat(locale).format(number);
  }, [currentLanguage]);

  // Format dates according to language locale
  const formatDate = useCallback((date: Date | string | number): string => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const locale = currentLanguage === 'en' ? 'en-US' : 
                   currentLanguage === 'hi' ? 'hi-IN' :
                   currentLanguage === 'ta' ? 'ta-IN' :
                   currentLanguage === 'te' ? 'te-IN' :
                   'en-US';
    
    return dateObj.toLocaleDateString(locale);
  }, [currentLanguage]);

  return useMemo(() => ({
    currentLanguage,
    isLoading,
    isRTL,
    changeLanguage,
    translate,
    translatePlural,
    getCurrentLanguageData,
    getAvailableLanguages,
    formatNumber,
    formatDate,
    supportedLanguages,
  }), [
    currentLanguage,
    isLoading,
    isRTL,
    changeLanguage,
    translate,
    translatePlural,
    getCurrentLanguageData,
    getAvailableLanguages,
    formatNumber,
    formatDate,
  ]);
});