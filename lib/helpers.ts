import { Linking, Platform } from "react-native";

export function formatOMR(amount: number): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K OMR`;
  }
  return `${amount} OMR`;
}

export function formatDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function callPhone(phone: string) {
  Linking.openURL(`tel:${phone}`);
}

export function openWhatsApp(phone: string) {
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (Platform.OS === "web") {
    Linking.openURL(`https://wa.me/${cleaned}`);
  } else {
    Linking.openURL(`whatsapp://send?phone=${cleaned}`);
  }
}

export function getTransactionLabel(type: string): string {
  return type === "rent" ? "For Rent" : "For Sale";
}

export function getStatusColor(status: string): string {
  return status === "open" ? "#2E8B57" : "#9E9E9E";
}
