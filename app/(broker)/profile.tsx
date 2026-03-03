import { View, Text, Pressable, StyleSheet, Platform, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

export default function BrokerProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAdmin, signOut } = useAuth();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSignOut = () => {
    if (Platform.OS === "web") {
      signOut().then(() => router.replace("/(auth)/phone"));
      return;
    }
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/phone");
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: topPad }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 100 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={styles.title}>Profile</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || "?"}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profilePhone}>{user?.phone}</Text>
          {user?.agencyName && (
            <Text style={styles.agencyName}>{user.agencyName}</Text>
          )}
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Broker</Text>
          </View>
        </View>
      </View>

      {(user?.serviceAreas && user.serviceAreas.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Areas</Text>
          <View style={styles.chipRow}>
            {user.serviceAreas.map((a) => (
              <View key={a} style={styles.chip}>
                <Text style={styles.chipText}>{a}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {(user?.propertyTypes && user.propertyTypes.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Types</Text>
          <View style={styles.chipRow}>
            {user.propertyTypes.map((t) => (
              <View key={t} style={styles.chip}>
                <Text style={styles.chipText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.menu}>
        {isAdmin && (
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/admin");
            }}
          >
            <View style={[styles.menuIcon, { backgroundColor: Colors.warningLight }]}>
              <MaterialCommunityIcons name="shield-crown" size={20} color={Colors.warning} />
            </View>
            <Text style={styles.menuText}>Admin Panel</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
          </Pressable>
        )}

        <Pressable style={styles.menuItem} onPress={handleSignOut}>
          <View style={[styles.menuIcon, { backgroundColor: Colors.dangerLight }]}>
            <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          </View>
          <Text style={[styles.menuText, { color: Colors.danger }]}>Sign Out</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
        </Pressable>
      </View>
    </ScrollView>
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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accentLight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: Colors.accent,
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.text,
  },
  profilePhone: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  agencyName: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.accent,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: Colors.accentLight,
    marginTop: 2,
  },
  roleText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.accent,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
  },
  chipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.primary,
  },
  menu: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: "hidden",
    marginTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: Colors.text,
  },
});
