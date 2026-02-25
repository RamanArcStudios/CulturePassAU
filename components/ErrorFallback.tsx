import React, { useState, useCallback } from "react";
import { reloadAppAsync } from "expo";
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  Text,
  Modal,
  useColorScheme,
  Platform,
  Alert,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

export type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
  retryCount?: number;
  maxRetries?: number;
};

export function ErrorFallback({ 
  error, 
  resetError, 
  retryCount = 0, 
  maxRetries = 3 
}: ErrorFallbackProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  const theme = {
    background: Colors.background,
    surface: Colors.surfacePrimary,
    surfaceSecondary: Colors.surfaceSecondary,
    text: Colors.textPrimary,
    textSecondary: Colors.textSecondary,
    textTertiary: Colors.textTertiary,
    danger: Colors.danger,
    primary: Colors.primary,
    accent: Colors.accent,
  };

  const handleReset = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    resetError();
  }, [resetError]);

  const handleRestart = useCallback(async () => {
    if (isRestarting) return;
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    try {
      setIsRestarting(true);
      await reloadAppAsync();
    } catch (restartError) {
      console.error("❌ Failed to restart app:", restartError);
      setIsRestarting(false);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      Alert.alert(
        "Restart Failed",
        "Unable to restart app. Please try resetting manually.",
        [{ text: 'OK', onPress: resetError }]
      );
    }
  }, [isRestarting, resetError]);

  const handleShareError = useCallback(async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const errorText = `CulturePass Error Report\n\n${error.message}\n\n${error.stack?.slice(0, 1000) || 'No stack trace'}`;
    
    try {
      if (Platform.OS === 'web' && navigator.share) {
        await navigator.share({
          title: 'CulturePass Error Report',
          text: errorText,
        });
      } else {
        await Share.share({
          title: 'CulturePass Error Report',
          message: errorText,
        });
      }
    } catch (shareError) {
      console.error('Share error failed:', shareError);
    }
  }, [error]);

  const formatErrorDetails = (): string => {
    return `🚨 Error: ${error.message}\n\n📍 Stack Trace:\n${error.stack || 'No stack trace available'}\n\n⏰ Time: ${new Date().toISOString()}`;
  };

  const monoFont = Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "Courier New",
    web: "SF Mono, Monaco, 'Cascadia Code', monospace",
  });

  const showDevTools = __DEV__;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Dev Debug Button */}
      {showDevTools && (
        <Pressable
          onPress={() => setIsModalVisible(true)}
          accessibilityLabel="View technical error details"
          accessibilityRole="button"
          accessibilityHint="Opens detailed error information"
          style={({ pressed }) => [
            styles.devButton,
            {
              top: insets.top + 20,
              right: 20,
              backgroundColor: theme.surfaceSecondary,
              opacity: pressed ? 0.8 : 1,
              ...Colors.shadows.small,
            },
          ]}
        >
          <Feather name="bug" size={20} color={theme.textSecondary} />
        </Pressable>
      )}

      {/* Main Error Content */}
      <View style={styles.content}>
        <Ionicons 
          name="alert-circle-outline" 
          size={72} 
          color={theme.danger} 
          style={styles.errorIcon}
        />
        
        <Text style={[styles.title, { color: theme.text }]}>
          Something went wrong
        </Text>
        
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          We've encountered an unexpected error
        </Text>
        
        <Text style={[styles.attempts, { color: theme.textTertiary }]}>
          {retryCount >= 1 && `Auto-retry ${retryCount}/${maxRetries} attempted`}
        </Text>

        <View style={styles.actionButtons}>
          <Pressable
            onPress={handleReset}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: theme.primary,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
                ...Colors.shadows.medium,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Reset and continue"
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </Pressable>

          <Pressable
            onPress={handleRestart}
            disabled={isRestarting}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                backgroundColor: isRestarting ? theme.surfaceSecondary : theme.surface,
                opacity: pressed && !isRestarting ? 0.8 : 1,
                borderColor: isRestarting ? theme.textTertiary : theme.primary,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={isRestarting ? "Restarting..." : "Restart app"}
          >
            {isRestarting ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <>
                <Ionicons name="refresh" size={18} color={theme.primary} />
                <Text style={styles.secondaryButtonText}>Restart App</Text>
              </>
            )}
          </Pressable>
        </View>

        {showDevTools && (
          <Pressable
            onPress={handleShareError}
            style={({ pressed }) => [
              styles.shareButton,
              {
                backgroundColor: theme.surfaceSecondary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Share error report"
          >
            <Feather name="share-2" size={18} color={theme.textSecondary} />
            <Text style={styles.shareButtonText}>Share Error Report</Text>
          </Pressable>
        )}
      </View>

      {/* Dev Error Modal */}
      {showDevTools && (
        <Modal
          visible={isModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsModalVisible(false)}
          statusBarTranslucent
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
              {/* Modal Header */}
              <View style={[styles.modalHeader, { 
                borderBottomColor: Colors.borderLight[colorScheme || 'light'],
                backgroundColor: theme.surface
              }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Error Details</Text>
                <Pressable
                  onPress={() => setIsModalVisible(false)}
                  hitSlop={12}
                  style={({ pressed }) => [
                    styles.modalCloseButton,
                    { opacity: pressed ? 0.7 : 1 }
                  ]}
                >
                  <Feather name="x" size={26} color={theme.textSecondary} />
                </Pressable>
              </View>

              {/* Error Content */}
              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Error Summary */}
                <View style={[styles.errorCard, { backgroundColor: theme.surfaceSecondary }]}>
                  <View style={styles.errorHeader}>
                    <Feather name="alert-triangle" size={20} color={theme.danger} />
                    <Text style={[styles.errorType, { color: theme.text }]}>{error.name}</Text>
                  </View>
                  <Text style={[styles.errorMessage, { color: theme.text }]} selectable>
                    {error.message}
                  </Text>
                </View>

                {/* Stack Trace */}
                {error.stack && (
                  <View style={[styles.stackCard, { backgroundColor: theme.surfaceSecondary }]}>
                    <Text style={[styles.stackTitle, { color: theme.textSecondary }]}>Stack Trace</Text>
                    <ScrollView style={styles.stackScroll} nestedScrollEnabled>
                      <Text 
                        style={[
                          styles.stackText,
                          { fontFamily: monoFont, color: theme.textSecondary }
                        ]} 
                        selectable
                      >
                        {error.stack}
                      </Text>
                    </ScrollView>
                  </View>
                )}

                {/* App Info */}
                <View style={[styles.infoCard, { backgroundColor: theme.surfaceSecondary }]}>
                  <Text style={[styles.infoTitle, { color: theme.textSecondary }]}>App Info</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Platform:</Text>
                    <Text style={styles.infoValue}>{Platform.OS?.toUpperCase()}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Version:</Text>
                    <Text style={styles.infoValue}>{__DEV__ ? 'Development' : 'Production'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Time:</Text>
                    <Text style={styles.infoValue}>{new Date().toLocaleString()}</Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const monoFont = Platform.select({
  ios: "Menlo",
  android: "monospace",
  web: "SF Mono, Monaco, 'Cascadia Code', 'Roboto Mono', monospace",
  default: "monospace",
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    paddingTop: 24,
  },
  content: {
    alignItems: 'center',
    gap: 24,
    width: '100%',
    maxWidth: 400,
  },
  errorIcon: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    lineHeight: 36,
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: 17,
    fontFamily: 'Poppins_500Medium',
    textAlign: 'center',
    lineHeight: 26,
  },
  attempts: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    minWidth: 160,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1.5,
    minWidth: 160,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  shareButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },

  // Dev Modal
  devButton: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContainer: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 40 : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 16 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    padding: 20,
    paddingBottom: 32,
    gap: 20,
  },
  errorCard: {
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorType: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 24,
  },
  stackCard: {
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  stackTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  stackScroll: {
    maxHeight: 300,
  },
  stackText: {
    fontSize: 13,
    lineHeight: 20,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});
