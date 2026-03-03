import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import type { UserRole } from "@/lib/types";

export default function RoleSelectScreen() {
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [selected, setSelected] = useState<UserRole | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleSelect = (role: UserRole) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(role);
  };

  const handleContinue = () => {
    if (!selected) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(auth)/profile-setup",
      params: { phone: phone || "", role: selected },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: topPad + 20 }]}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={Colors.text} />
      </Pressable>

      <Text style={styles.title}>How will you use Daar?</Text>
      <Text style={styles.subtitle}>Choose your role to get started</Text>

      <View style={styles.cards}>
        <Pressable
          style={[styles.card, selected === "requester" && styles.cardSelected]}
          onPress={() => handleSelect("requester")}
        >
          <View style={[styles.cardIcon, selected === "requester" && styles.cardIconSelected]}>
            <Ionicons name="search" size={28} color={selected === "requester" ? Colors.white : Colors.primary} />
          </View>
          <Text style={styles.cardTitle}>I'm looking for property</Text>
          <Text style={styles.cardDesc}>
            Post what you need and receive offers from verified brokers
          </Text>
          {selected === "requester" && (
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={16} color={Colors.white} />
            </View>
          )}
        </Pressable>

        <Pressable
          style={[styles.card, selected === "broker" && styles.cardSelected]}
          onPress={() => handleSelect("broker")}
        >
          <View style={[styles.cardIcon, selected === "broker" && styles.cardIconSelected]}>
            <MaterialCommunityIcons
              name="handshake"
              size={28}
              color={selected === "broker" ? Colors.white : Colors.primary}
            />
          </View>
          <Text style={styles.cardTitle}>I'm a broker / agent</Text>
          <Text style={styles.cardDesc}>
            Find clients looking for properties and send them your offers
          </Text>
          {selected === "broker" && (
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={16} color={Colors.white} />
            </View>
          )}
        </Pressable>
      </View>

      <Pressable
        style={[styles.button, !selected && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={!selected}
      >
        <Text style={styles.buttonText}>Continue</Text>
        <Ionicons name="arrow-forward" size={20} color={Colors.white} />
      </Pressable>
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
    marginBottom: 16,
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
    marginBottom: 32,
  },
  cards: {
    gap: 16,
    marginBottom: 32,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  cardIconSelected: {
    backgroundColor: Colors.primary,
  },
  cardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: Colors.text,
    marginBottom: 6,
  },
  cardDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  checkBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
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
