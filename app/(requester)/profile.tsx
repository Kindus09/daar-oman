import { View, Text, Pressable, StyleSheet, Platform, Alert } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

export default function RequesterProfileScreen() {
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
    <View style={[styles.container, { paddingTop: topPad }]}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || "?"}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profilePhone}>{user?.phone}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Requester</Text>
          </View>
        </View>
      </View>

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

      <View style={[styles.footer, { paddingBottom: bottomPad + 100 }]}>
        <Text style={styles.footerText}>Daar v1.0</Text>
      </View>
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
    marginBottom: 24,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: Colors.primary,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
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
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    marginTop: 2,
  },
  roleText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.primary,
  },
  menu: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: "hidden",
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
  footer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  footerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textTertiary,
  },
});
