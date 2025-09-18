import { Redirect, Tabs } from "expo-router";
import { Home, MessageCircle, BookOpen, User, Calendar, Settings, Users, BarChart3, Activity } from "lucide-react-native";
import React from "react";
import { theme } from "@/constants/theme";
import { useAuth } from "@/hooks/auth-store";

export default function TabLayout() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (!user?.isOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  // Role-based tab configuration
  const getTabsForRole = () => {
    const commonScreenOptions = {
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textSecondary,
      headerShown: false,
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.border,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500' as const,
      },
    };

    if (user?.role === 'student') {
      return (
        <Tabs screenOptions={commonScreenOptions}>
          <Tabs.Screen
            name="home"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              title: "Support",
              tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="resources"
            options={{
              title: "Resources",
              tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
            }}
          />
        </Tabs>
      );
    }

    if (user?.role === 'counselor') {
      return (
        <Tabs screenOptions={commonScreenOptions}>
          <Tabs.Screen
            name="home"
            options={{
              title: "Dashboard",
              tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="appointments"
            options={{
              title: "Bookings",
              tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              title: "Chat",
              tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="resources"
            options={{
              title: "Manage",
              tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
            }}
          />
        </Tabs>
      );
    }

    if (user?.role === 'volunteer') {
      return (
        <Tabs screenOptions={commonScreenOptions}>
          <Tabs.Screen
            name="home"
            options={{
              title: "Dashboard",
              tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="community"
            options={{
              title: "Community",
              tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              title: "Support",
              tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
            }}
          />
        </Tabs>
      );
    }

    if (user?.role === 'admin') {
      return (
        <Tabs screenOptions={commonScreenOptions}>
          <Tabs.Screen
            name="home"
            options={{
              title: "Dashboard",
              tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="users"
            options={{
              title: "Users",
              tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="resources"
            options={{
              title: "Content",
              tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="activities"
            options={{
              title: "Activities",
              tabBarIcon: ({ color, size }) => <Activity color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
            }}
          />
        </Tabs>
      );
    }

    // Default fallback
    return (
      <Tabs screenOptions={commonScreenOptions}>
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          }}
        />
      </Tabs>
    );
  };

  return getTabsForRole();
}