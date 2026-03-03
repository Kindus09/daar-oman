import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

export default function PhoneScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const isValid = phone.replace(/[^0-9]/g, "").length >= 8;

  const handleContinue = async () => {
    if (!isValid) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);

    const formatted = phone.startsWith("+") ? phone : `+968${phone.replace(/[^0-9]/g, "")}`;

    const existing = await signIn(formatted);
    setLoading(false);

    if (existing) {
      if (existing.role === "broker") {
        router.replace("/(broker)");
      } else {
        router.replace("/(requester)");
      }
    } else {
      router.push({ pathname: "/(auth)/role-select", params: { phone: formatted } });
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad + 40 }]}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="home" size={32} color={Colors.white} />
        </View>
        <Text style={styles.title}>Daar</Text>
        <Text style={styles.subtitle}>Oman's Reverse Real Estate Marketplace</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Enter your phone number</Text>
        <View style={styles.phoneRow}>
          <View style={styles.countryCode}>
            <Text style={styles.countryText}>+968</Text>
          </View>
          <TextInput
            ref={inputRef}
            style={styles.phoneInput}
            placeholder="91234567"
            placeholderTextColor={Colors.textTertiary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={12}
            autoFocus
          />
        </View>

        <Pressable
          style={[styles.button, !isValid && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!isValid || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Verifying..." : "Continue"}
          </Text>
          {!loading && <Ionicons name="arrow-forward" size={20} color={Colors.white} />}
        </Pressable>

        <Text style={styles.hint}>
          Sign in or create a new account
        </Text>
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
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  form: {
    gap: 16,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: "row",
    gap: 10,
  },
  countryCode: {
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  countryText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.text,
  },
  phoneInput: {
    flex: 1,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.text,
  },
  button: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: Colors.textTertiary,
  },
  buttonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.white,
  },
  hint: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: "center",
  },
});
