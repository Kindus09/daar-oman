import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { AREAS, PROPERTY_TYPES, type UserRole, type TransactionType } from "@/lib/types";

export default function ProfileSetupScreen() {
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();
  const { phone, role } = useLocalSearchParams<{ phone: string; role: UserRole }>();
  const [name, setName] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedModes, setSelectedModes] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(false);

  const isBroker = role === "broker";
  const isValid = name.trim().length >= 2;

  const toggleItem = <T extends string>(arr: T[], item: T, setter: (v: T[]) => void) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setter(arr.includes(item) ? arr.filter((a) => a !== item) : [...arr, item]);
  };

  const handleCreate = async () => {
    if (!isValid || !phone || !role) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    await signUp(phone, name.trim(), role, {
      ...(isBroker
        ? {
            agencyName: agencyName.trim() || undefined,
            serviceAreas: selectedAreas,
            propertyTypes: selectedTypes,
            rentBuyModes: selectedModes,
          }
        : {}),
    });

    setLoading(false);

    if (role === "broker") {
      router.replace("/(broker)");
    } else {
      router.replace("/(requester)");
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topPad + 20 }]}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={Colors.text} />
      </Pressable>

      <Text style={styles.title}>Set up your profile</Text>
      <Text style={styles.subtitle}>
        {isBroker ? "Tell clients about your services" : "Let brokers know who you are"}
      </Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomPad + 80 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor={Colors.textTertiary}
          value={name}
          onChangeText={setName}
          autoFocus
        />

        {isBroker && (
          <>
            <Text style={styles.label}>Agency Name (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Your agency"
              placeholderTextColor={Colors.textTertiary}
              value={agencyName}
              onChangeText={setAgencyName}
            />

            <Text style={styles.label}>Service Areas</Text>
            <View style={styles.chipGrid}>
              {AREAS.map((area) => (
                <Pressable
                  key={area}
                  style={[styles.chip, selectedAreas.includes(area) && styles.chipSelected]}
                  onPress={() => toggleItem(selectedAreas, area, setSelectedAreas)}
                >
                  <Text
                    style={[styles.chipText, selectedAreas.includes(area) && styles.chipTextSelected]}
                  >
                    {area}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Property Types</Text>
            <View style={styles.chipGrid}>
              {PROPERTY_TYPES.map((pt) => (
                <Pressable
                  key={pt}
                  style={[styles.chip, selectedTypes.includes(pt) && styles.chipSelected]}
                  onPress={() => toggleItem(selectedTypes, pt, setSelectedTypes)}
                >
                  <Text
                    style={[styles.chipText, selectedTypes.includes(pt) && styles.chipTextSelected]}
                  >
                    {pt}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Transaction Types</Text>
            <View style={styles.chipGrid}>
              {(["rent", "buy"] as TransactionType[]).map((mode) => (
                <Pressable
                  key={mode}
                  style={[styles.chip, selectedModes.includes(mode) && styles.chipSelected]}
                  onPress={() => toggleItem(selectedModes, mode, setSelectedModes)}
                >
                  <Text
                    style={[styles.chipText, selectedModes.includes(mode) && styles.chipTextSelected]}
                  >
                    {mode === "rent" ? "Rent" : "Buy"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomPad + 8 }]}>
        <Pressable
          style={[styles.button, !isValid && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={!isValid || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creating..." : "Get Started"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  scroll: {
    flex: 1,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.text,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.text,
  },
  chipTextSelected: {
    color: Colors.white,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  button: {
    height: 52,
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
