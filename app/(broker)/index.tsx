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

export default function BrokerMatchedScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const allReqs = await store.getRequests();
    const blocks = await store.getBlocks();
    const blockedByIds = blocks
      .filter((b) => b.blockedId === user.id)
      .map((b) => b.blockerId);

    const matched = allReqs.filter((r) => {
      if (r.status !== "open") return false;
      if (blockedByIds.includes(r.userId)) return false;

      const areaMatch =
        !user.serviceAreas?.length || user.serviceAreas.includes(r.area);
      const typeMatch =
        !user.propertyTypes?.length || user.propertyTypes.includes(r.propertyType);
      const modeMatch =
        !user.rentBuyModes?.length || user.rentBuyModes.includes(r.transactionType);

      return areaMatch && typeMatch && modeMatch;
    });

    setRequests(matched.sort((a, b) => b.createdAt - a.createdAt));
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

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
        <Ionicons name="sparkles" size={16} color={Colors.accent} />
      </View>
      <Text style={styles.cardType}>{item.propertyType}</Text>
      <View style={styles.cardRow}>
        <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
        <Text style={styles.cardArea}>{item.area}</Text>
      </View>
      <View style={styles.cardRow}>
        <Ionicons name="person-outline" size={14} color={Colors.textSecondary} />
        <Text style={styles.cardArea}>{item.userName}</Text>
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
          <Text style={styles.greeting}>Matched Requests</Text>
          <Text style={styles.headerSub}>{requests.length} matches found</Text>
        </View>
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
            <Ionicons name="sparkles-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No matches yet</Text>
            <Text style={styles.emptyText}>
              Update your profile to match with relevant requests
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
  header: {
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
    marginBottom: 4,
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
    marginTop: 8,
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
