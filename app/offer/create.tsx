import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { store } from "@/lib/storage";

export default function CreateOfferScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const [message, setMessage] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = message.trim().length > 0;

  const handleSend = async () => {
    if (!isValid || !user || !requestId) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    const request = await store.getRequestById(requestId);
    if (!request) {
      setLoading(false);
      return;
    }

    await store.createOffer({
      requestId,
      brokerId: user.id,
      brokerName: user.name,
      brokerPhone: user.phone,
      message: message.trim(),
      linkUrl: linkUrl.trim() || undefined,
      price: price ? parseFloat(price) : undefined,
    });

    await store.findOrCreateThread({
      requestId,
      requesterId: request.userId,
      brokerId: user.id,
      requesterName: request.userName,
      brokerName: user.name,
    });

    setLoading(false);
    router.back();
  };

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={styles.container}>
      <View style={[styles.form, { paddingBottom: bottomPad + 80 }]}>
        <Text style={styles.label}>Message</Text>
        <TextInput
          style={[styles.input, styles.inputMulti]}
          placeholder="Describe your offer or say 'I have matching options, let's talk'"
          placeholderTextColor={Colors.textTertiary}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
          autoFocus
        />

        <Text style={styles.label}>Link URL (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://listing-url.com"
          placeholderTextColor={Colors.textTertiary}
          value={linkUrl}
          onChangeText={setLinkUrl}
          keyboardType="url"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Price (optional, OMR)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 350"
          placeholderTextColor={Colors.textTertiary}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
      </View>

      <View style={[styles.bottomBar, { paddingBottom: bottomPad + 8 }]}>
        <Pressable
          style={[styles.button, !isValid && styles.buttonDisabled]}
          onPress={handleSend}
          disabled={!isValid || loading}
        >
          <Text style={styles.buttonText}>{loading ? "Sending..." : "Send Offer"}</Text>
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
  form: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 4,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.text,
    marginBottom: 6,
    marginTop: 12,
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
    height: 110,
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
