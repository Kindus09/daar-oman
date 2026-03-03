import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="phone" />
      <Stack.Screen name="role-select" />
      <Stack.Screen name="profile-setup" />
    </Stack>
  );
}
