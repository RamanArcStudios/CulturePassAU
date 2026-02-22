import { Stack } from "expo-router";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import Colors from "@/constants/colors";

export default function OnboardingLayout() {
  const { state, isLoading } = useOnboarding();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (state.isComplete) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="location" />
      <Stack.Screen name="communities" />
      <Stack.Screen name="interests" />
    </Stack>
  );
}
