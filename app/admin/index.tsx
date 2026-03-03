import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { store } from "@/lib/storage";
import { formatDate } from "@/lib/helpers";
import type { UserProfile, PropertyRequest, Offer, ReportRecord } from "@/lib/types";

type AdminTab = "users" | "requests" | "offers" | "reports";

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState<AdminTab>("users");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);

  const load = useCallback(async () => {
    const [u, r, o, rep] = await Promise.all([
      store.getUsers(),
      store.getRequests(),
      store.getOffers(),
      store.getReports(),
    ]);
    setUsers(u);
    setRequests(r);
    setOffers(o);
    setReports(rep);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!isAdmin) {
    return (
      <View style={styles.denied}>
        <Ionicons name="lock-closed" size={48} color={Colors.textTertiary} />
        <Text style={styles.deniedText}>Admin access required</Text>
      </View>
    );
  }

  const handleDisableUser = (userId: string, disabled: boolean) => {
    const action = disabled ? "enable" : "disable";
    if (Platform.OS === "web") {
      store.updateUser(userId, { disabled: !disabled }).then(load);
      return;
    }
    Alert.alert(
      `${disabled ? "Enable" : "Disable"} User`,
      `Are you sure you want to ${action} this user?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: disabled ? "default" : "destructive",
          onPress: () => store.updateUser(userId, { disabled: !disabled }).then(load),
        },
      ]
    );
  };

  const handleDeleteRequest = (id: string) => {
    if (Platform.OS === "web") {
      store.deleteRequest(id).then(load);
      return;
    }
    Alert.alert("Delete Request", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => store.deleteRequest(id).then(load) },
    ]);
  };

  const handleDeleteOffer = (id: string) => {
    if (Platform.OS === "web") {
      store.deleteOffer(id).then(load);
      return;
    }
    Alert.alert("Delete Offer", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => store.deleteOffer(id).then(load) },
    ]);
  };

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const tabs: { key: AdminTab; label: string; count: number }[] = [
    { key: "users", label: "Users", count: users.length },
    { key: "requests", label: "Requests", count: requests.length },
    { key: "offers", label: "Offers", count: offers.length },
    { key: "reports", label: "Reports", count: reports.length },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {tabs.map((t) => (
          <Pressable
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setTab(t.key);
            }}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
              {t.label} ({t.count})
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {tab === "users" && (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 20 }]}
          renderItem={({ item }) => (
            <View style={[styles.adminCard, item.disabled && styles.adminCardDisabled]}>
              <View style={styles.adminCardRow}>
                <View style={styles.adminCardInfo}>
                  <Text style={styles.adminCardName}>{item.name}</Text>
                  <Text style={styles.adminCardSub}>{item.phone} - {item.role}</Text>
                </View>
                <Pressable
                  style={[styles.actionBtn, item.disabled ? styles.enableBtn : styles.disableBtn]}
                  onPress={() => handleDisableUser(item.id, !!item.disabled)}
                >
                  <Text style={styles.actionBtnText}>{item.disabled ? "Enable" : "Disable"}</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      {tab === "requests" && (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 20 }]}
          renderItem={({ item }) => (
            <View style={styles.adminCard}>
              <View style={styles.adminCardRow}>
                <View style={styles.adminCardInfo}>
                  <Text style={styles.adminCardName}>{item.propertyType} - {item.area}</Text>
                  <Text style={styles.adminCardSub}>By {item.userName} - {item.status}</Text>
                </View>
                <Pressable style={styles.deleteBtn} onPress={() => handleDeleteRequest(item.id)}>
                  <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      {tab === "offers" && (
        <FlatList
          data={offers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 20 }]}
          renderItem={({ item }) => (
            <View style={styles.adminCard}>
              <View style={styles.adminCardRow}>
                <View style={styles.adminCardInfo}>
                  <Text style={styles.adminCardName} numberOfLines={1}>{item.message}</Text>
                  <Text style={styles.adminCardSub}>By {item.brokerName}</Text>
                </View>
                <Pressable style={styles.deleteBtn} onPress={() => handleDeleteOffer(item.id)}>
                  <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      {tab === "reports" && (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 20 }]}
          renderItem={({ item }) => (
            <View style={styles.adminCard}>
              <Text style={styles.adminCardName}>Report</Text>
              <Text style={styles.adminCardSub}>Reason: {item.reason}</Text>
              <Text style={styles.adminCardSub}>{formatDate(item.createdAt)}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No reports</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  denied: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  deniedText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.textSecondary,
  },
  tabBar: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tabBarContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  adminCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  adminCardDisabled: {
    opacity: 0.5,
  },
  adminCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  adminCardInfo: {
    flex: 1,
    gap: 2,
  },
  adminCardName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  adminCardSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  enableBtn: {
    backgroundColor: Colors.successLight,
  },
  disableBtn: {
    backgroundColor: Colors.dangerLight,
  },
  actionBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: Colors.text,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textTertiary,
  },
});
