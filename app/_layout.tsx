import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { AuthProvider } from "@/hooks/auth-store";
import { MoodProvider } from "@/hooks/mood-store";
import { NotificationProvider } from "@/hooks/notification-store";
import { OfflineProvider } from "@/hooks/offline-store";
import { LanguageProvider } from "@/hooks/language-store";
import { SecurityProvider } from "@/hooks/security-store";
import { AccessibilityProvider } from "@/hooks/accessibility-store";
import { AppointmentProvider } from "@/hooks/appointment-store";
import { AnalyticsProvider } from "@/hooks/analytics-store";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="resource/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SecurityProvider>
          <AccessibilityProvider>
            <LanguageProvider>
              <OfflineProvider>
                <NotificationProvider>
                  <AppointmentProvider>
                    <AnalyticsProvider>
                      <MoodProvider>
                        <GestureHandlerRootView style={styles.container}>
                          <RootLayoutNav />
                        </GestureHandlerRootView>
                      </MoodProvider>
                    </AnalyticsProvider>
                  </AppointmentProvider>
                </NotificationProvider>
              </OfflineProvider>
            </LanguageProvider>
          </AccessibilityProvider>
        </SecurityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});