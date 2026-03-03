import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import Colors from "@/constants/colors";

export default function IndexScreen() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/(auth)/phone");
    } else if (user.role === "broker") {
      router.replace("/(broker)");
    } else {
      router.replace("/(requester)");
    }
  }, [user, isLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
});
