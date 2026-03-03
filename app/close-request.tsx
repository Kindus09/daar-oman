import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { store } from "@/lib/storage";
import type { CloseOutcome } from "@/lib/types";

const OUTCOMES: { value: CloseOutcome; label: string; icon: string }[] = [
  { value: "rented", label: "Found a rental", icon: "key" },
  { value: "bought", label: "Made a purchase", icon: "home" },
  { value: "not_interested", label: "No longer interested", icon: "close-circle" },
  { value: "still_looking", label: "Still looking elsewhere", icon: "search" },
];

export default function CloseRequestSheet() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const [selected, setSelected] = useState<CloseOutcome | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClose = async () => {
    if (!selected || !requestId) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    await store.updateRequest(requestId, { status: "closed", closeOutcome: selected });
    setLoading(false);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Close Request</Text>
      <Text style={styles.subtitle}>What's the outcome?</Text>

      <View style={styles.options}>
        {OUTCOMES.map((o) => (
          <Pressable
            key={o.value}
            style={[styles.option, selected === o.value && styles.optionSelected]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelected(o.value);
            }}
          >
            <Text style={[styles.optionText, selected === o.value && styles.optionTextSelected]}>
              {o.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[styles.button, !selected && styles.buttonDisabled]}
        onPress={handleClose}
        disabled={!selected || loading}
      >
        <Text style={styles.buttonText}>{loading ? "Closing..." : "Confirm"}</Text>
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
  options: {
    gap: 10,
    marginBottom: 20,
  },
  option: {
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  optionSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  optionText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: Colors.text,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontFamily: "Inter_600SemiBold",
  },
  button: {
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.primary,
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
