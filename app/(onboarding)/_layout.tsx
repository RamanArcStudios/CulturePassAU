import { Stack } from "expo-router";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

export default function OnboardingLayout() {
  const { state, isLoading } = useOnboarding();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (state.isComplete) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack 
      screenOptions={{ 
        headerShown: false, 
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="location" />
      <Stack.Screen name="communities" />
      <Stack.Screen name="interests" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
