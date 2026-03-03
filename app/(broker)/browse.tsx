import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  Platform,
  ScrollView,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { store } from "@/lib/storage";
import { formatOMR, formatDate, getTransactionLabel } from "@/lib/helpers";
import { PROPERTY_TYPES, AREAS, type PropertyRequest, type TransactionType } from "@/lib/types";

export default function BrokerBrowseScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [filterProperty, setFilterProperty] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const allReqs = await store.getRequests();
    const blocks = await store.getBlocks();
    const blockedByIds = blocks.filter((b) => b.blockedId === user.id).map((b) => b.blockerId);

    let filtered = allReqs.filter((r) => r.status === "open" && !blockedByIds.includes(r.userId));

    if (filterType !== "all") {
      filtered = filtered.filter((r) => r.transactionType === filterType);
    }
    if (filterProperty !== "all") {
      filtered = filtered.filter((r) => r.propertyType === filterProperty);
    }

    setRequests(filtered.sort((a, b) => b.createdAt - a.createdAt));
  }, [user, filterType, filterProperty]);

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
        <Text style={styles.greeting}>All Requests</Text>
        <Pressable
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
          onPress={() => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowFilters(!showFilters);
          }}
        >
          <Ionicons name="options-outline" size={20} color={showFilters ? Colors.white : Colors.primary} />
        </Pressable>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>Transaction Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <View style={styles.filterRow}>
              {(["all", "rent", "buy"] as const).map((t) => (
                <Pressable
                  key={t}
                  style={[styles.filterChip, filterType === t && styles.filterChipActive]}
                  onPress={() => { setFilterType(t); }}
                >
                  <Text style={[styles.filterChipText, filterType === t && styles.filterChipTextActive]}>
                    {t === "all" ? "All" : t === "rent" ? "Rent" : "Buy"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.filterLabel}>Property Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <View style={styles.filterRow}>
              <Pressable
                style={[styles.filterChip, filterProperty === "all" && styles.filterChipActive]}
                onPress={() => setFilterProperty("all")}
              >
                <Text style={[styles.filterChipText, filterProperty === "all" && styles.filterChipTextActive]}>All</Text>
              </Pressable>
              {PROPERTY_TYPES.map((pt) => (
                <Pressable
                  key={pt}
                  style={[styles.filterChip, filterProperty === pt && styles.filterChipActive]}
                  onPress={() => setFilterProperty(pt)}
                >
                  <Text style={[styles.filterChipText, filterProperty === pt && styles.filterChipTextActive]}>{pt}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

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
            <Ionicons name="search-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No requests found</Text>
            <Text style={styles.emptyText}>Try adjusting your filters</Text>
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
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  filterLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  filterScroll: {
    marginBottom: 4,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.text,
  },
  filterChipTextActive: {
    color: Colors.white,
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
