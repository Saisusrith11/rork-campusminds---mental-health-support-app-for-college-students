import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from './auth-store';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalAssessments: number;
  averageScore: number;
  riskDistribution: {
    minimal: number;
    moderate: number;
    high: number;
  };
  appointmentStats: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
  };
  resourceUsage: {
    totalViews: number;
    popularResources: Array<{
      id: string;
      title: string;
      views: number;
    }>;
  };
  wellnessActivityStats: {
    totalCompletions: number;
    popularActivities: Array<{
      id: string;
      title: string;
      completions: number;
    }>;
  };
  communityStats: {
    totalPosts: number;
    totalReplies: number;
    activeVolunteers: number;
  };
  monthlyTrends: Array<{
    month: string;
    assessments: number;
    appointments: number;
    resourceViews: number;
  }>;
}

const ANALYTICS_KEY = 'campusminds_analytics';

// Demo analytics data
const demoAnalytics: AnalyticsData = {
  totalUsers: 1247,
  activeUsers: 892,
  totalAssessments: 3456,
  averageScore: 14.2,
  riskDistribution: {
    minimal: 45,
    moderate: 38,
    high: 17
  },
  appointmentStats: {
    total: 234,
    completed: 189,
    pending: 28,
    cancelled: 17
  },
  resourceUsage: {
    totalViews: 8934,
    popularResources: [
      { id: 'res-001', title: 'Managing Academic Stress', views: 1234 },
      { id: 'res-002', title: 'Sleep Hygiene for Students', views: 987 },
      { id: 'res-003', title: 'Social Anxiety Management', views: 876 },
      { id: 'res-004', title: 'Time Management Techniques', views: 654 },
      { id: 'res-005', title: 'Mindful Eating Guide', views: 543 }
    ]
  },
  wellnessActivityStats: {
    totalCompletions: 5678,
    popularActivities: [
      { id: 'act-001', title: 'Deep Breathing Exercise', completions: 1456 },
      { id: 'act-002', title: 'Progressive Muscle Relaxation', completions: 1234 },
      { id: 'act-003', title: 'Mindfulness Meditation', completions: 987 },
      { id: 'act-004', title: 'Gratitude Journaling', completions: 765 },
      { id: 'act-005', title: 'Body Scan Meditation', completions: 543 }
    ]
  },
  communityStats: {
    totalPosts: 456,
    totalReplies: 1234,
    activeVolunteers: 23
  },
  monthlyTrends: [
    { month: 'Aug 2024', assessments: 234, appointments: 45, resourceViews: 1234 },
    { month: 'Sep 2024', assessments: 267, appointments: 52, resourceViews: 1456 },
    { month: 'Oct 2024', assessments: 298, appointments: 61, resourceViews: 1678 },
    { month: 'Nov 2024', assessments: 334, appointments: 67, resourceViews: 1890 },
    { month: 'Dec 2024', assessments: 378, appointments: 73, resourceViews: 2134 },
    { month: 'Jan 2025', assessments: 412, appointments: 89, resourceViews: 2456 }
  ]
};

export const [AnalyticsProvider, useAnalytics] = createContextHook(() => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(demoAnalytics);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      const stored = await AsyncStorage.getItem(ANALYTICS_KEY);
      if (stored && stored.trim()) {
        try {
          const parsed = JSON.parse(stored);
          setAnalyticsData(parsed && typeof parsed === 'object' ? parsed : demoAnalytics);
        } catch (parseError) {
          console.error('Failed to parse analytics, using demo data:', parseError);
          setAnalyticsData(demoAnalytics);
          await AsyncStorage.setItem(ANALYTICS_KEY, JSON.stringify(demoAnalytics));
        }
      } else {
        // Load demo data for first time
        setAnalyticsData(demoAnalytics);
        await AsyncStorage.setItem(ANALYTICS_KEY, JSON.stringify(demoAnalytics));
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setAnalyticsData(demoAnalytics);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    setIsLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would fetch fresh data from the server
    // For demo, we'll just reload the stored data
    await loadAnalytics();
  };

  // Computed metrics - always calculate to maintain hooks order
  const computedMetrics = useMemo(() => {
    if (user?.role !== 'admin') {
      return null;
    }
    
    const userEngagementRate = (analyticsData.activeUsers / analyticsData.totalUsers) * 100;
    const appointmentCompletionRate = (analyticsData.appointmentStats.completed / analyticsData.appointmentStats.total) * 100;
    const highRiskPercentage = (analyticsData.riskDistribution.high / 100) * 100;
    
    const currentMonth = analyticsData.monthlyTrends[analyticsData.monthlyTrends.length - 1];
    const previousMonth = analyticsData.monthlyTrends[analyticsData.monthlyTrends.length - 2];
    
    const assessmentGrowth = previousMonth 
      ? ((currentMonth.assessments - previousMonth.assessments) / previousMonth.assessments) * 100
      : 0;
    
    const appointmentGrowth = previousMonth
      ? ((currentMonth.appointments - previousMonth.appointments) / previousMonth.appointments) * 100
      : 0;

    return {
      userEngagementRate: Math.round(userEngagementRate * 10) / 10,
      appointmentCompletionRate: Math.round(appointmentCompletionRate * 10) / 10,
      highRiskPercentage: Math.round(highRiskPercentage * 10) / 10,
      assessmentGrowth: Math.round(assessmentGrowth * 10) / 10,
      appointmentGrowth: Math.round(appointmentGrowth * 10) / 10
    };
  }, [analyticsData, user?.role]);

  // Risk level insights - always calculate to maintain hooks order
  const riskInsights = useMemo(() => {
    if (user?.role !== 'admin') {
      return null;
    }
    
    const total = analyticsData.riskDistribution.minimal + 
                  analyticsData.riskDistribution.moderate + 
                  analyticsData.riskDistribution.high;
    
    return {
      minimal: {
        count: analyticsData.riskDistribution.minimal,
        percentage: Math.round((analyticsData.riskDistribution.minimal / total) * 100)
      },
      moderate: {
        count: analyticsData.riskDistribution.moderate,
        percentage: Math.round((analyticsData.riskDistribution.moderate / total) * 100)
      },
      high: {
        count: analyticsData.riskDistribution.high,
        percentage: Math.round((analyticsData.riskDistribution.high / total) * 100)
      }
    };
  }, [analyticsData.riskDistribution, user?.role]);

  // Always return the same structure to maintain hooks order
  const contextValue = useMemo(() => ({
    analyticsData: user?.role === 'admin' ? analyticsData : null,
    computedMetrics,
    riskInsights,
    isLoading: user?.role === 'admin' ? isLoading : false,
    refreshAnalytics: user?.role === 'admin' ? refreshAnalytics : () => Promise.resolve()
  }), [analyticsData, computedMetrics, riskInsights, isLoading, refreshAnalytics, user?.role]);

  return contextValue;
});