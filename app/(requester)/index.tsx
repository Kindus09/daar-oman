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
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { store } from "@/lib/storage";
import { formatOMR, formatDate, getTransactionLabel } from "@/lib/helpers";
import type { PropertyRequest } from "@/lib/types";

export default function RequesterHomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const all = await store.getRequests();
    setRequests(
      all.filter((r) => r.userId === user.id).sort((a, b) => b.createdAt - a.createdAt)
    );
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const renderItem = ({ item }: { item: PropertyRequest }) => (
    <Pressable
      style={styles.card}
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({ pathname: "/request/[id]", params: { id: item.id } });
      }}
    >
      <View style={styles.cardTop}>
        <View style={[styles.badge, item.transactionType === "rent" ? styles.badgeRent : styles.badgeBuy]}>
          <Text style={[styles.badgeText, item.transactionType === "rent" ? styles.badgeTextRent : styles.badgeTextBuy]}>
            {getTransactionLabel(item.transactionType)}
          </Text>
        </View>
        <View style={[styles.statusDot, item.status === "open" ? styles.statusOpen : styles.statusClosed]} />
      </View>
      <Text style={styles.cardType}>{item.propertyType}</Text>
      <View style={styles.cardRow}>
        <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
        <Text style={styles.cardArea}>{item.area}</Text>
      </View>
      <View style={styles.cardBottom}>
        <Text style={styles.cardBudget}>{formatOMR(item.budget)}</Text>
        <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>My Requests</Text>
          <Text style={styles.headerSub}>
            {requests.filter((r) => r.status === "open").length} open
          </Text>
        </View>
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/request/create");
          }}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </Pressable>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No requests yet</Text>
            <Text style={styles.emptyText}>
              Post what you're looking for and brokers will send you offers
            </Text>
            <Pressable
              style={styles.emptyBtn}
              onPress={() => router.push("/request/create")}
            >
              <Text style={styles.emptyBtnText}>Create Request</Text>
            </Pressable>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.text,
  },
  headerSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeRent: {
    backgroundColor: "#E8F5EC",
  },
  badgeBuy: {
    backgroundColor: "#E6F0FF",
  },
  badgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  badgeTextRent: {
    color: "#2E8B57",
  },
  badgeTextBuy: {
    color: "#2563EB",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusOpen: {
    backgroundColor: Colors.success,
  },
  statusClosed: {
    backgroundColor: Colors.textTertiary,
  },
  cardType: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: Colors.text,
    marginBottom: 6,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
  },
  cardArea: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardBudget: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.primary,
  },
  cardDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textTertiary,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
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
  emptyBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  emptyBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.white,
  },
});
