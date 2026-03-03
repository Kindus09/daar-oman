import { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { store } from "@/lib/storage";
import { formatTime, callPhone, openWhatsApp } from "@/lib/helpers";
import type { ChatThread, ChatMessage } from "@/lib/types";

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput>(null);

  const otherName = user?.role === "broker" ? thread?.requesterName : thread?.brokerName;
  const otherPhone = user?.role === "broker"
    ? (thread ? thread.requesterId : "")
    : (thread ? thread.brokerId : "");

  const load = useCallback(async () => {
    if (!threadId) return;
    const t = await store.getThreadById(threadId);
    setThread(t);
    if (t) {
      const msgs = await store.getMessages(t.id);
      setMessages(msgs.reverse());
    }
  }, [threadId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSend = async () => {
    if (!text.trim() || !user || !thread) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const msgText = text.trim();
    setText("");

    await store.sendMessage({
      threadId: thread.id,
      senderId: user.id,
      senderName: user.name,
      text: msgText,
    });

    inputRef.current?.focus();
    load();
  };

  const getOtherPhone = useCallback(async () => {
    if (!thread || !user) return "";
    if (user.role === "broker") {
      const requester = await store.getUserById(thread.requesterId);
      return requester?.phone || "";
    } else {
      const broker = await store.getUserById(thread.brokerId);
      return broker?.phone || "";
    }
  }, [thread, user]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: topPad }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View style={styles.navBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.navInfo}>
          <Text style={styles.navName} numberOfLines={1}>{otherName || "Chat"}</Text>
        </View>
        <View style={styles.navActions}>
          <Pressable
            style={styles.navActionBtn}
            onPress={async () => {
              const phone = await getOtherPhone();
              if (phone) callPhone(phone);
            }}
          >
            <Ionicons name="call-outline" size={20} color={Colors.primary} />
          </Pressable>
          <Pressable
            style={styles.navActionBtn}
            onPress={async () => {
              const phone = await getOtherPhone();
              if (phone) openWhatsApp(phone);
            }}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={styles.messageList}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const isMe = item.senderId === user?.id;
          return (
            <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
              <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleOther]}>
                <Text style={[styles.msgText, isMe ? styles.msgTextMe : styles.msgTextOther]}>
                  {item.text}
                </Text>
                <Text style={[styles.msgTime, isMe ? styles.msgTimeMe : styles.msgTimeOther]}>
                  {formatTime(item.createdAt)}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Ionicons name="chatbubble-ellipses-outline" size={40} color={Colors.textTertiary} />
            <Text style={styles.emptyChatText}>Start the conversation</Text>
          </View>
        }
      />

      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, Platform.OS === "web" ? 34 : 8) }]}>
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={Colors.textTertiary}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />
        <Pressable
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Ionicons name="send" size={18} color={text.trim() ? Colors.white : Colors.textTertiary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  navInfo: {
    flex: 1,
    paddingHorizontal: 8,
  },
  navName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: Colors.text,
  },
  navActions: {
    flexDirection: "row",
    gap: 4,
  },
  navActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  msgRow: {
    alignItems: "flex-start",
    marginBottom: 4,
  },
  msgRowMe: {
    alignItems: "flex-end",
  },
  msgBubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  msgBubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 6,
  },
  msgBubbleOther: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  msgText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 21,
  },
  msgTextMe: {
    color: Colors.white,
  },
  msgTextOther: {
    color: Colors.text,
  },
  msgTime: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 4,
  },
  msgTimeMe: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "right",
  },
  msgTimeOther: {
    color: Colors.textTertiary,
  },
  emptyChat: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
    transform: [{ scaleY: -1 }],
  },
  emptyChatText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.textTertiary,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 21,
    backgroundColor: Colors.surfaceSecondary,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.text,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: {
    backgroundColor: Colors.surfaceSecondary,
  },
});
