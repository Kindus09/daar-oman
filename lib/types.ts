export type UserRole = "requester" | "broker" | "admin";
export type TransactionType = "rent" | "buy";
export type RequestStatus = "open" | "closed";
export type CloseOutcome = "rented" | "bought" | "not_interested" | "still_looking";

export const PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Office",
  "Shop",
  "Warehouse",
  "Land",
] as const;

export const AREAS = [
  "All Areas – Muscat",
  "Al Amerat",
  "Al Ansab",
  "Al Azaibah",
  "Al Bustan",
  "Al Ghubrah",
  "Al Hail",
  "Al Hamriyyah",
  "Al Jifnayn",
  "Al Khoudh",
  "Al Khuwair",
  "Al Maabilah",
  "Al Mawalih",
  "Al Mawj",
  "Al Misfah",
  "Al Minumah",
  "Al Qurm",
  "Al Rusayl",
  "Al Seeb",
  "Al Sifah",
  "Al Wutayyah",
  "Barr Al Jassah",
  "Bawshar",
  "Darsait",
  "Ghala",
  "Halban",
  "Madinat Al Sultan Haitham",
  "Madinat Al Sultan Qaboos",
  "Muscat Hills",
  "Muttrah",
  "Qantab",
  "Qurayyat",
  "Ruwi",
  "Sidab",
  "Wadi Al Kabir",
  "Yenkit",
  "Yiti",
  "Other",
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type Area = (typeof AREAS)[number];

export interface UserProfile {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  agencyName?: string;
  serviceAreas?: string[];
  propertyTypes?: string[];
  rentBuyModes?: TransactionType[];
  disabled?: boolean;
  createdAt: number;
}

export interface PropertyRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  transactionType: TransactionType;
  propertyType: string;
  area: string;
  budget: number;
  description?: string;
  status: RequestStatus;
  closeOutcome?: CloseOutcome;
  createdAt: number;
}

export interface Offer {
  id: string;
  requestId: string;
  brokerId: string;
  brokerName: string;
  brokerPhone: string;
  message: string;
  linkUrl?: string;
  price?: number;
  createdAt: number;
}

export interface ChatThread {
  id: string;
  requestId: string;
  requesterId: string;
  brokerId: string;
  requesterName: string;
  brokerName: string;
  lastMessage?: string;
  lastMessageAt?: number;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: number;
}

export interface BlockRecord {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: number;
}

export interface ReportRecord {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: string;
  createdAt: number;
}
