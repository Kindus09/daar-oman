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
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { store } from "@/lib/storage";
import { PROPERTY_TYPES, AREAS, type TransactionType } from "@/lib/types";

export default function CreateRequestScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [transactionType, setTransactionType] = useState<TransactionType>("rent");
  const [propertyType, setPropertyType] = useState("");
  const [area, setArea] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = propertyType && area && budget && parseFloat(budget) > 0;

  const handleCreate = async () => {
    if (!isValid || !user) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    await store.createRequest({
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      transactionType,
      propertyType,
      area,
      budget: parseFloat(budget),
      description: description.trim() || undefined,
    });

    setLoading(false);
    router.back();
  };

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 80 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>What are you looking for?</Text>

        <Text style={styles.label}>Transaction Type</Text>
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggle, transactionType === "rent" && styles.toggleActive]}
            onPress={() => setTransactionType("rent")}
          >
            <Ionicons name="key-outline" size={18} color={transactionType === "rent" ? Colors.white : Colors.text} />
            <Text style={[styles.toggleText, transactionType === "rent" && styles.toggleTextActive]}>Rent</Text>
          </Pressable>
          <Pressable
            style={[styles.toggle, transactionType === "buy" && styles.toggleActive]}
            onPress={() => setTransactionType("buy")}
          >
            <Ionicons name="cart-outline" size={18} color={transactionType === "buy" ? Colors.white : Colors.text} />
            <Text style={[styles.toggleText, transactionType === "buy" && styles.toggleTextActive]}>Buy</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Property Type</Text>
        <View style={styles.chipGrid}>
          {PROPERTY_TYPES.map((pt) => (
            <Pressable
              key={pt}
              style={[styles.chip, propertyType === pt && styles.chipSelected]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPropertyType(pt);
              }}
            >
              <Text style={[styles.chipText, propertyType === pt && styles.chipTextSelected]}>{pt}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Area</Text>
        <View style={styles.chipGrid}>
          {AREAS.map((a) => (
            <Pressable
              key={a}
              style={[styles.chip, area === a && styles.chipSelected]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setArea(a);
              }}
            >
              <Text style={[styles.chipText, area === a && styles.chipTextSelected]}>{a}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Budget (OMR)</Text>
        <TextInput
          style={styles.input}
          placeholder={transactionType === "rent" ? "Monthly rent (e.g., 350)" : "Price (e.g., 250000)"}
          placeholderTextColor={Colors.textTertiary}
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.inputMulti]}
          placeholder="Any specific requirements..."
          placeholderTextColor={Colors.textTertiary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomPad + 8 }]}>
        <Pressable
          style={[styles.button, !isValid && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={!isValid || loading}
        >
          <Text style={styles.buttonText}>{loading ? "Creating..." : "Post Request"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.text,
    marginBottom: 20,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  toggle: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  toggleText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  toggleTextActive: {
    color: Colors.white,
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
  inputMulti: {
    height: 90,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
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
