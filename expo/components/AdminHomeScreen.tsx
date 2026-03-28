import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  BookOpen,
  Activity,
  MessageSquare,
  BarChart3,
  Shield,
  Heart,
  Brain,
  RefreshCw,
  Upload
} from 'lucide-react-native';
import FileUploadModal from '@/components/FileUploadModal';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/auth-store';
import { useAnalytics } from '@/hooks/analytics-store';
import { router } from 'expo-router';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  onPress?: () => void;
}

function MetricCard({ title, value, change, icon, color, onPress }: MetricCardProps) {
  return (
    <TouchableOpacity 
      style={[styles.metricCard, { borderTopColor: color }]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
        {change !== undefined && (
          <View style={[styles.changeIndicator, { 
            backgroundColor: change >= 0 ? theme.colors.success + '20' : theme.colors.error + '20' 
          }]}>
            <TrendingUp 
              size={12} 
              color={change >= 0 ? theme.colors.success : theme.colors.error}
              style={{ transform: [{ rotate: change >= 0 ? '0deg' : '180deg' }] }}
            />
            <Text style={[styles.changeText, { 
              color: change >= 0 ? theme.colors.success : theme.colors.error 
            }]}>
              {Math.abs(change)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

interface RiskDistributionProps {
  riskInsights: any;
}

function RiskDistribution({ riskInsights }: RiskDistributionProps) {
  if (!riskInsights) return null;

  return (
    <View style={styles.riskDistribution}>
      <Text style={styles.sectionTitle}>Mental Health Risk Distribution</Text>
      <View style={styles.riskCards}>
        <View style={[styles.riskCard, { borderLeftColor: theme.colors.success }]}>
          <Shield size={20} color={theme.colors.success} />
          <View style={styles.riskInfo}>
            <Text style={styles.riskValue}>{riskInsights.minimal.count}</Text>
            <Text style={styles.riskLabel}>Minimal Risk</Text>
            <Text style={styles.riskPercentage}>{riskInsights.minimal.percentage}%</Text>
          </View>
        </View>
        
        <View style={[styles.riskCard, { borderLeftColor: theme.colors.warning }]}>
          <Heart size={20} color={theme.colors.warning} />
          <View style={styles.riskInfo}>
            <Text style={styles.riskValue}>{riskInsights.moderate.count}</Text>
            <Text style={styles.riskLabel}>Moderate Risk</Text>
            <Text style={styles.riskPercentage}>{riskInsights.moderate.percentage}%</Text>
          </View>
        </View>
        
        <View style={[styles.riskCard, { borderLeftColor: theme.colors.error }]}>
          <Brain size={20} color={theme.colors.error} />
          <View style={styles.riskInfo}>
            <Text style={styles.riskValue}>{riskInsights.high.count}</Text>
            <Text style={styles.riskLabel}>High Risk</Text>
            <Text style={styles.riskPercentage}>{riskInsights.high.percentage}%</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function AdminHomeScreen() {
  const { user } = useAuth();
  const { analyticsData, computedMetrics, riskInsights, isLoading, refreshAnalytics } = useAnalytics();
  const [refreshing, setRefreshing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshAnalytics();
    setRefreshing(false);
  };

  const handleFileUpload = (file: any, fileName: string) => {
    console.log('Admin file uploaded:', { fileName, file });
    // Here you would typically upload the file to your server
    // For now, we'll just log it
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (!analyticsData || !computedMetrics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <AlertTriangle size={48} color={theme.colors.warning} />
          <Text style={styles.unauthorizedText}>
            Admin access required to view this dashboard
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.name || 'Admin'}</Text>
            <Text style={styles.subtitle}>Campus Mental Health Analytics Dashboard</Text>
          </View>
          
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <RefreshCw size={20} color={theme.colors.primary} />
            <Text style={styles.refreshText}>Refresh Data</Text>
          </TouchableOpacity>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Total Active Users"
              value={analyticsData.activeUsers.toLocaleString()}
              change={computedMetrics.assessmentGrowth}
              icon={<Users size={24} color={theme.colors.primary} />}
              color={theme.colors.primary}
            />
            <MetricCard
              title="User Engagement Rate"
              value={`${computedMetrics.userEngagementRate}%`}
              icon={<TrendingUp size={24} color={theme.colors.success} />}
              color={theme.colors.success}
            />
            <MetricCard
              title="High Risk Students"
              value={analyticsData.riskDistribution.high}
              icon={<AlertTriangle size={24} color={theme.colors.error} />}
              color={theme.colors.error}
            />
            <MetricCard
              title="Completed Sessions"
              value={analyticsData.appointmentStats.completed}
              change={computedMetrics.appointmentGrowth}
              icon={<Calendar size={24} color={theme.colors.focus} />}
              color={theme.colors.focus}
            />
          </View>
        </View>

        {/* Risk Distribution */}
        <View style={styles.riskSection}>
          <RiskDistribution riskInsights={riskInsights} />
        </View>

        {/* Resource & Activity Stats */}
        <View style={styles.usageSection}>
          <Text style={styles.sectionTitle}>Platform Usage Statistics</Text>
          <View style={styles.usageGrid}>
            <View style={styles.usageCard}>
              <View style={styles.usageHeader}>
                <BookOpen size={20} color={theme.colors.accent} />
                <Text style={styles.usageTitle}>Resource Library</Text>
              </View>
              <Text style={styles.usageValue}>{analyticsData.resourceUsage.totalViews.toLocaleString()}</Text>
              <Text style={styles.usageLabel}>Total Views</Text>
              <Text style={styles.usageSubtext}>
                Most popular: {analyticsData.resourceUsage.popularResources[0]?.title}
              </Text>
            </View>
            
            <View style={styles.usageCard}>
              <View style={styles.usageHeader}>
                <Activity size={20} color={theme.colors.energy} />
                <Text style={styles.usageTitle}>Wellness Activities</Text>
              </View>
              <Text style={styles.usageValue}>{analyticsData.wellnessActivityStats.totalCompletions.toLocaleString()}</Text>
              <Text style={styles.usageLabel}>Completions</Text>
              <Text style={styles.usageSubtext}>
                Most popular: {analyticsData.wellnessActivityStats.popularActivities[0]?.title}
              </Text>
            </View>
            
            <View style={styles.usageCard}>
              <View style={styles.usageHeader}>
                <MessageSquare size={20} color={theme.colors.warning} />
                <Text style={styles.usageTitle}>Community Support</Text>
              </View>
              <Text style={styles.usageValue}>{analyticsData.communityStats.totalPosts}</Text>
              <Text style={styles.usageLabel}>Total Posts</Text>
              <Text style={styles.usageSubtext}>
                {analyticsData.communityStats.activeVolunteers} active volunteers
              </Text>
            </View>
          </View>
        </View>

        {/* Monthly Trends */}
        <View style={styles.trendsSection}>
          <Text style={styles.sectionTitle}>6-Month Trends</Text>
          <View style={styles.trendsContainer}>
            {analyticsData.monthlyTrends.slice(-6).map((trend, index) => (
              <View key={trend.month} style={styles.trendItem}>
                <Text style={styles.trendMonth}>{trend.month}</Text>
                <View style={styles.trendMetrics}>
                  <View style={styles.trendMetric}>
                    <Text style={styles.trendValue}>{trend.assessments}</Text>
                    <Text style={styles.trendLabel}>Assessments</Text>
                  </View>
                  <View style={styles.trendMetric}>
                    <Text style={styles.trendValue}>{trend.appointments}</Text>
                    <Text style={styles.trendLabel}>Appointments</Text>
                  </View>
                  <View style={styles.trendMetric}>
                    <Text style={styles.trendValue}>{trend.resourceViews}</Text>
                    <Text style={styles.trendLabel}>Resource Views</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Administrative Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/(tabs)/resources')}
            >
              <LinearGradient 
                colors={[theme.colors.primary, theme.colors.secondary]} 
                style={styles.quickActionGradient}
              >
                <BookOpen size={24} color={theme.colors.surface} />
                <Text style={styles.quickActionText}>Manage Resources</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/wellness-activities')}
            >
              <LinearGradient 
                colors={[theme.colors.success, theme.colors.calm]} 
                style={styles.quickActionGradient}
              >
                <Activity size={24} color={theme.colors.surface} />
                <Text style={styles.quickActionText}>Wellness Activities</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <LinearGradient 
                colors={[theme.colors.focus, theme.colors.accent]} 
                style={styles.quickActionGradient}
              >
                <BarChart3 size={24} color={theme.colors.surface} />
                <Text style={styles.quickActionText}>Detailed Reports</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/community')}
            >
              <LinearGradient 
                colors={[theme.colors.warning, theme.colors.energy]} 
                style={styles.quickActionGradient}
              >
                <MessageSquare size={24} color={theme.colors.surface} />
                <Text style={styles.quickActionText}>Community Moderation</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => setShowUploadModal(true)}
            >
              <LinearGradient 
                colors={[theme.colors.accent, theme.colors.focus]} 
                style={styles.quickActionGradient}
              >
                <Upload size={24} color={theme.colors.surface} />
                <Text style={styles.quickActionText}>Upload Files</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
      
      <FileUploadModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleFileUpload}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  welcomeSection: {
    marginBottom: theme.spacing.lg,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
  },
  userName: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    alignSelf: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  metricsSection: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderTopWidth: 4,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  metricTitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  riskSection: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  riskDistribution: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  riskCards: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  riskCard: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  riskInfo: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  riskValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  riskLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  riskPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginTop: 2,
  },
  usageSection: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  usageGrid: {
    gap: theme.spacing.md,
  },
  usageCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  usageValue: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  usageLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  usageSubtext: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  trendsSection: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  trendsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  trendItem: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  trendMonth: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  trendMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendMetric: {
    alignItems: 'center',
  },
  trendValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  trendLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  quickActionsSection: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionGradient: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.surface,
    textAlign: 'center',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  unauthorizedText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});