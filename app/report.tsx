import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { store } from "@/lib/storage";

export default function ReportSheet() {
  const { user } = useAuth();
  const { reportedId } = useLocalSearchParams<{ reportedId: string }>();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim() || !user || !reportedId) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    await store.createReport({
      reporterId: user.id,
      reportedId,
      reason: reason.trim(),
    });
    setLoading(false);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report User</Text>
      <Text style={styles.subtitle}>Tell us what happened</Text>

      <TextInput
        style={styles.input}
        placeholder="Describe the issue..."
        placeholderTextColor={Colors.textTertiary}
        value={reason}
        onChangeText={setReason}
        multiline
        numberOfLines={4}
        autoFocus
      />

      <Pressable
        style={[styles.button, !reason.trim() && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!reason.trim() || loading}
      >
        <Text style={styles.buttonText}>{loading ? "Submitting..." : "Submit Report"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  input: {
    height: 100,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingTop: 14,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.text,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  button: {
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.danger,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: Colors.textTertiary,
  },
  buttonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.white,
  },
});
