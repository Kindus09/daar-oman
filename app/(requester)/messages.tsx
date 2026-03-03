import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  Platform,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { store } from "@/lib/storage";
import { formatDate } from "@/lib/helpers";
import type { ChatThread } from "@/lib/types";

export default function RequesterMessagesScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const all = await store.getThreads();
    setThreads(
      all
        .filter((t) => t.requesterId === user.id)
        .sort((a, b) => (b.lastMessageAt || b.createdAt) - (a.lastMessageAt || a.createdAt))
    );
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <Text style={styles.title}>Messages</Text>

      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.threadRow}
            onPress={() => router.push({ pathname: "/chat/[threadId]", params: { threadId: item.id } })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.brokerName.charAt(0)}</Text>
            </View>
            <View style={styles.threadInfo}>
              <Text style={styles.threadName} numberOfLines={1}>{item.brokerName}</Text>
              <Text style={styles.threadMsg} numberOfLines={1}>
                {item.lastMessage || "No messages yet"}
              </Text>
            </View>
            {item.lastMessageAt && (
              <Text style={styles.threadTime}>{formatDate(item.lastMessageAt)}</Text>
            )}
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptyText}>
              Messages with brokers will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.text,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  list: {
    paddingBottom: 100,
  },
  threadRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.primary,
  },
  threadInfo: {
    flex: 1,
    gap: 3,
  },
  threadName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.text,
  },
  threadMsg: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  threadTime: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textTertiary,
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.text,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
