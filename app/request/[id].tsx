import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { store } from "@/lib/storage";
import { formatOMR, formatDate, getTransactionLabel, callPhone, openWhatsApp } from "@/lib/helpers";
import type { PropertyRequest, Offer } from "@/lib/types";

export default function RequestDetailScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [request, setRequest] = useState<PropertyRequest | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);

  const isOwner = user?.id === request?.userId;
  const isBroker = user?.role === "broker";

  const load = useCallback(async () => {
    if (!id) return;
    const req = await store.getRequestById(id);
    setRequest(req);
    if (req) {
      const allOffers = await store.getOffersForRequest(req.id);
      setOffers(allOffers.sort((a, b) => b.createdAt - a.createdAt));
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSendOffer = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/offer/create", params: { requestId: id } });
  };

  const handleChat = async (offer: Offer) => {
    if (!user || !request) return;
    const thread = await store.findOrCreateThread({
      requestId: request.id,
      requesterId: request.userId,
      brokerId: offer.brokerId,
      requesterName: request.userName,
      brokerName: offer.brokerName,
    });
    router.push({ pathname: "/chat/[threadId]", params: { threadId: thread.id } });
  };

  const handleBlock = (brokerId: string) => {
    if (Platform.OS === "web") {
      store.blockUser(user!.id, brokerId).then(load);
      return;
    }
    Alert.alert("Block Broker", "They won't be able to send you offers or messages.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Block",
        style: "destructive",
        onPress: async () => {
          await store.blockUser(user!.id, brokerId);
          load();
        },
      },
    ]);
  };

  const handleReport = (brokerId: string) => {
    router.push({ pathname: "/report", params: { reportedId: brokerId } });
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!request) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.navBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.navTitle}>Request Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomPad + 80 }]}
        ListHeaderComponent={
          <View>
            <View style={styles.detailCard}>
              <View style={styles.detailTop}>
                <View style={[styles.badge, request.transactionType === "rent" ? styles.badgeRent : styles.badgeBuy]}>
                  <Text style={[styles.badgeText, request.transactionType === "rent" ? styles.badgeTextRent : styles.badgeTextBuy]}>
                    {getTransactionLabel(request.transactionType)}
                  </Text>
                </View>
                <View style={[styles.statusBadge, request.status === "open" ? styles.statusOpen : styles.statusClosed]}>
                  <Text style={styles.statusText}>{request.status === "open" ? "Open" : "Closed"}</Text>
                </View>
              </View>

              <Text style={styles.detailType}>{request.propertyType}</Text>

              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.detailLabel}>{request.area}</Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="cash-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.detailLabel}>{formatOMR(request.budget)}</Text>
              </View>

              {!isOwner && (
                <View style={styles.detailRow}>
                  <Ionicons name="person-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.detailLabel}>{request.userName}</Text>
                </View>
              )}

              {request.description && (
                <Text style={styles.detailDesc}>{request.description}</Text>
              )}

              <Text style={styles.detailDate}>Posted {formatDate(request.createdAt)}</Text>

              {!isOwner && request.status === "open" && (
                <View style={styles.contactRow}>
                  <Pressable style={styles.callBtn} onPress={() => callPhone(request.userPhone)}>
                    <Ionicons name="call" size={18} color={Colors.white} />
                    <Text style={styles.callBtnText}>Call</Text>
                  </Pressable>
                  <Pressable style={styles.waBtn} onPress={() => openWhatsApp(request.userPhone)}>
                    <Ionicons name="logo-whatsapp" size={18} color={Colors.white} />
                    <Text style={styles.waBtnText}>WhatsApp</Text>
                  </Pressable>
                </View>
              )}

              {isOwner && request.status === "open" && (
                <Pressable
                  style={styles.closeBtn}
                  onPress={() => {
                    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({ pathname: "/close-request", params: { requestId: request.id } });
                  }}
                >
                  <Text style={styles.closeBtnText}>Close Request</Text>
                </Pressable>
              )}

              {request.closeOutcome && (
                <View style={styles.outcomeBadge}>
                  <Text style={styles.outcomeText}>
                    Outcome: {request.closeOutcome.replace("_", " ")}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.offersTitle}>
              Offers ({offers.length})
            </Text>
          </View>
        }
        renderItem={({ item: offer }) => (
          <View style={styles.offerCard}>
            <View style={styles.offerHeader}>
              <View style={styles.offerAvatar}>
                <Text style={styles.offerAvatarText}>{offer.brokerName.charAt(0)}</Text>
              </View>
              <View style={styles.offerInfo}>
                <Text style={styles.offerName}>{offer.brokerName}</Text>
                <Text style={styles.offerDate}>{formatDate(offer.createdAt)}</Text>
              </View>
              {isOwner && (
                <View style={styles.offerActions}>
                  <Pressable
                    style={styles.offerActionBtn}
                    onPress={() => handleReport(offer.brokerId)}
                  >
                    <Ionicons name="flag-outline" size={18} color={Colors.textTertiary} />
                  </Pressable>
                  <Pressable
                    style={styles.offerActionBtn}
                    onPress={() => handleBlock(offer.brokerId)}
                  >
                    <Ionicons name="ban-outline" size={18} color={Colors.danger} />
                  </Pressable>
                </View>
              )}
            </View>

            <Text style={styles.offerMsg}>{offer.message}</Text>

            {offer.price && (
              <View style={styles.offerPriceRow}>
                <Ionicons name="pricetag-outline" size={14} color={Colors.primary} />
                <Text style={styles.offerPrice}>{formatOMR(offer.price)}</Text>
              </View>
            )}

            {offer.linkUrl && (
              <Pressable style={styles.offerLink}>
                <Ionicons name="link-outline" size={14} color={Colors.primary} />
                <Text style={styles.offerLinkText} numberOfLines={1}>{offer.linkUrl}</Text>
              </Pressable>
            )}

            <View style={styles.offerFooter}>
              <Pressable style={styles.chatOfferBtn} onPress={() => handleChat(offer)}>
                <Ionicons name="chatbubble-outline" size={16} color={Colors.primary} />
                <Text style={styles.chatOfferText}>Chat</Text>
              </Pressable>
              <Pressable style={styles.contactSmallBtn} onPress={() => callPhone(offer.brokerPhone)}>
                <Ionicons name="call-outline" size={16} color={Colors.textSecondary} />
              </Pressable>
              <Pressable style={styles.contactSmallBtn} onPress={() => openWhatsApp(offer.brokerPhone)}>
                <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyOffers}>
            <Text style={styles.emptyText}>No offers yet</Text>
          </View>
        }
      />

      {isBroker && request.status === "open" && !isOwner && (
        <View style={[styles.bottomBar, { paddingBottom: bottomPad + 8 }]}>
          <Pressable style={styles.sendOfferBtn} onPress={handleSendOffer}>
            <Ionicons name="paper-plane" size={18} color={Colors.white} />
            <Text style={styles.sendOfferText}>Send Offer</Text>
          </Pressable>
        </View>
      )}
    </View>
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
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  navTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: Colors.text,
  },
  loadingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 100,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  detailCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 24,
  },
  detailTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeRent: { backgroundColor: "#E8F5EC" },
  badgeBuy: { backgroundColor: "#E6F0FF" },
  badgeText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  badgeTextRent: { color: "#2E8B57" },
  badgeTextBuy: { color: "#2563EB" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusOpen: { backgroundColor: Colors.successLight },
  statusClosed: { backgroundColor: Colors.surfaceSecondary },
  statusText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: Colors.text,
  },
  detailType: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.text,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  detailLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: Colors.textSecondary,
  },
  detailDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginTop: 10,
    padding: 12,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
  },
  detailDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 12,
  },
  contactRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  callBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  callBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.white,
  },
  waBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#25D366",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  waBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.white,
  },
  closeBtn: {
    marginTop: 14,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  outcomeBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.accentLight,
  },
  outcomeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.accent,
    textTransform: "capitalize" as const,
  },
  offersTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.text,
    marginBottom: 12,
  },
  offerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  offerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  offerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accentLight,
    justifyContent: "center",
    alignItems: "center",
  },
  offerAvatarText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.accent,
  },
  offerInfo: {
    flex: 1,
  },
  offerName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  offerDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textTertiary,
  },
  offerActions: {
    flexDirection: "row",
    gap: 4,
  },
  offerActionBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  offerMsg: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  offerPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  offerPrice: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.primary,
  },
  offerLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  offerLinkText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.primary,
    flex: 1,
  },
  offerFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  chatOfferBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
  },
  chatOfferText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.primary,
  },
  contactSmallBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyOffers: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textTertiary,
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
  sendOfferBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  sendOfferText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.white,
  },
});
