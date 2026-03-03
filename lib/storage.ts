import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  UserProfile,
  PropertyRequest,
  Offer,
  ChatThread,
  ChatMessage,
  BlockRecord,
  ReportRecord,
} from "./types";

const KEYS = {
  CURRENT_USER: "daar_current_user",
  USERS: "daar_users",
  REQUESTS: "daar_requests",
  OFFERS: "daar_offers",
  THREADS: "daar_threads",
  MESSAGES: "daar_messages",
  BLOCKS: "daar_blocks",
  REPORTS: "daar_reports",
  SEEDED: "daar_seeded",
};

function uid(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

async function getList<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

async function setList<T>(key: string, data: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

export const store = {
  uid,

  async getCurrentUser(): Promise<UserProfile | null> {
    const raw = await AsyncStorage.getItem(KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  },

  async setCurrentUser(user: UserProfile | null): Promise<void> {
    if (user) {
      await AsyncStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(KEYS.CURRENT_USER);
    }
  },

  async getUsers(): Promise<UserProfile[]> {
    return getList<UserProfile>(KEYS.USERS);
  },

  async getUserById(id: string): Promise<UserProfile | null> {
    const users = await getList<UserProfile>(KEYS.USERS);
    return users.find((u) => u.id === id) || null;
  },

  async getUserByPhone(phone: string): Promise<UserProfile | null> {
    const users = await getList<UserProfile>(KEYS.USERS);
    return users.find((u) => u.phone === phone) || null;
  },

  async createUser(user: Omit<UserProfile, "id" | "createdAt">): Promise<UserProfile> {
    const users = await getList<UserProfile>(KEYS.USERS);
    const newUser: UserProfile = { ...user, id: uid(), createdAt: Date.now() };
    users.push(newUser);
    await setList(KEYS.USERS, users);
    return newUser;
  },

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const users = await getList<UserProfile>(KEYS.USERS);
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    await setList(KEYS.USERS, users);
    return users[idx];
  },

  async getRequests(): Promise<PropertyRequest[]> {
    return getList<PropertyRequest>(KEYS.REQUESTS);
  },

  async getRequestById(id: string): Promise<PropertyRequest | null> {
    const reqs = await getList<PropertyRequest>(KEYS.REQUESTS);
    return reqs.find((r) => r.id === id) || null;
  },

  async createRequest(req: Omit<PropertyRequest, "id" | "createdAt" | "status">): Promise<PropertyRequest> {
    const reqs = await getList<PropertyRequest>(KEYS.REQUESTS);
    const newReq: PropertyRequest = { ...req, id: uid(), status: "open", createdAt: Date.now() };
    reqs.push(newReq);
    await setList(KEYS.REQUESTS, reqs);
    return newReq;
  },

  async updateRequest(id: string, updates: Partial<PropertyRequest>): Promise<PropertyRequest | null> {
    const reqs = await getList<PropertyRequest>(KEYS.REQUESTS);
    const idx = reqs.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    reqs[idx] = { ...reqs[idx], ...updates };
    await setList(KEYS.REQUESTS, reqs);
    return reqs[idx];
  },

  async deleteRequest(id: string): Promise<void> {
    const reqs = await getList<PropertyRequest>(KEYS.REQUESTS);
    await setList(KEYS.REQUESTS, reqs.filter((r) => r.id !== id));
  },

  async getOffers(): Promise<Offer[]> {
    return getList<Offer>(KEYS.OFFERS);
  },

  async getOffersForRequest(requestId: string): Promise<Offer[]> {
    const offers = await getList<Offer>(KEYS.OFFERS);
    return offers.filter((o) => o.requestId === requestId);
  },

  async createOffer(offer: Omit<Offer, "id" | "createdAt">): Promise<Offer> {
    const offers = await getList<Offer>(KEYS.OFFERS);
    const newOffer: Offer = { ...offer, id: uid(), createdAt: Date.now() };
    offers.push(newOffer);
    await setList(KEYS.OFFERS, offers);
    return newOffer;
  },

  async deleteOffer(id: string): Promise<void> {
    const offers = await getList<Offer>(KEYS.OFFERS);
    await setList(KEYS.OFFERS, offers.filter((o) => o.id !== id));
  },

  async getThreads(): Promise<ChatThread[]> {
    return getList<ChatThread>(KEYS.THREADS);
  },

  async getThreadById(id: string): Promise<ChatThread | null> {
    const threads = await getList<ChatThread>(KEYS.THREADS);
    return threads.find((t) => t.id === id) || null;
  },

  async findOrCreateThread(data: {
    requestId: string;
    requesterId: string;
    brokerId: string;
    requesterName: string;
    brokerName: string;
  }): Promise<ChatThread> {
    const threads = await getList<ChatThread>(KEYS.THREADS);
    const existing = threads.find(
      (t) => t.requestId === data.requestId && t.requesterId === data.requesterId && t.brokerId === data.brokerId
    );
    if (existing) return existing;
    const newThread: ChatThread = { ...data, id: uid(), createdAt: Date.now() };
    threads.push(newThread);
    await setList(KEYS.THREADS, threads);
    return newThread;
  },

  async updateThread(id: string, updates: Partial<ChatThread>): Promise<void> {
    const threads = await getList<ChatThread>(KEYS.THREADS);
    const idx = threads.findIndex((t) => t.id === id);
    if (idx === -1) return;
    threads[idx] = { ...threads[idx], ...updates };
    await setList(KEYS.THREADS, threads);
  },

  async getMessages(threadId: string): Promise<ChatMessage[]> {
    const all = await getList<ChatMessage>(KEYS.MESSAGES);
    return all.filter((m) => m.threadId === threadId).sort((a, b) => a.createdAt - b.createdAt);
  },

  async sendMessage(msg: Omit<ChatMessage, "id" | "createdAt">): Promise<ChatMessage> {
    const all = await getList<ChatMessage>(KEYS.MESSAGES);
    const newMsg: ChatMessage = { ...msg, id: uid(), createdAt: Date.now() };
    all.push(newMsg);
    await setList(KEYS.MESSAGES, all);
    await store.updateThread(msg.threadId, {
      lastMessage: msg.text,
      lastMessageAt: newMsg.createdAt,
    });
    return newMsg;
  },

  async getBlocks(): Promise<BlockRecord[]> {
    return getList<BlockRecord>(KEYS.BLOCKS);
  },

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const blocks = await getList<BlockRecord>(KEYS.BLOCKS);
    return blocks.some((b) => b.blockerId === blockerId && b.blockedId === blockedId);
  },

  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    const blocks = await getList<BlockRecord>(KEYS.BLOCKS);
    if (blocks.some((b) => b.blockerId === blockerId && b.blockedId === blockedId)) return;
    blocks.push({ id: uid(), blockerId, blockedId, createdAt: Date.now() });
    await setList(KEYS.BLOCKS, blocks);
  },

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    const blocks = await getList<BlockRecord>(KEYS.BLOCKS);
    await setList(KEYS.BLOCKS, blocks.filter((b) => !(b.blockerId === blockerId && b.blockedId === blockedId)));
  },

  async getReports(): Promise<ReportRecord[]> {
    return getList<ReportRecord>(KEYS.REPORTS);
  },

  async createReport(report: Omit<ReportRecord, "id" | "createdAt">): Promise<void> {
    const reports = await getList<ReportRecord>(KEYS.REPORTS);
    reports.push({ ...report, id: uid(), createdAt: Date.now() });
    await setList(KEYS.REPORTS, reports);
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },

  async seedData(): Promise<void> {
    const seeded = await AsyncStorage.getItem(KEYS.SEEDED);
    if (seeded) return;

    const brokers: UserProfile[] = [
      {
        id: "broker1",
        phone: "+96891234567",
        name: "Ahmed Al-Balushi",
        role: "broker",
        agencyName: "Oman Premier Properties",
        serviceAreas: ["Al Khuwair", "Al Qurm", "Muttrah"],
        propertyTypes: ["Apartment", "Villa"],
        rentBuyModes: ["rent", "buy"],
        createdAt: Date.now() - 86400000 * 30,
      },
      {
        id: "broker2",
        phone: "+96892345678",
        name: "Fatima Al-Rashdi",
        role: "broker",
        agencyName: "Gulf Realty",
        serviceAreas: ["Al Mawj", "Bawshar", "Al Seeb"],
        propertyTypes: ["Villa", "Land"],
        rentBuyModes: ["buy"],
        createdAt: Date.now() - 86400000 * 20,
      },
      {
        id: "broker3",
        phone: "+96893456789",
        name: "Khalid Al-Habsi",
        role: "broker",
        serviceAreas: ["Ruwi", "Al Ghubrah", "Madinat Al Sultan Qaboos"],
        propertyTypes: ["Apartment", "Office"],
        rentBuyModes: ["rent"],
        createdAt: Date.now() - 86400000 * 10,
      },
    ];

    const requests: PropertyRequest[] = [
      {
        id: "req1",
        userId: "user_seed1",
        userName: "Mohammed Al-Siyabi",
        userPhone: "+96894567890",
        transactionType: "rent",
        propertyType: "Apartment",
        area: "Al Khuwair",
        budget: 350,
        description: "Looking for a 2BHK apartment near the highway",
        status: "open",
        createdAt: Date.now() - 86400000 * 5,
      },
      {
        id: "req2",
        userId: "user_seed2",
        userName: "Sara Al-Lawati",
        userPhone: "+96895678901",
        transactionType: "buy",
        propertyType: "Villa",
        area: "Al Mawj",
        budget: 250000,
        description: "Family villa with garden, 4+ bedrooms",
        status: "open",
        createdAt: Date.now() - 86400000 * 3,
      },
      {
        id: "req3",
        userId: "user_seed1",
        userName: "Mohammed Al-Siyabi",
        userPhone: "+96894567890",
        transactionType: "rent",
        propertyType: "Office",
        area: "Ruwi",
        budget: 500,
        description: "Small office space for a startup",
        status: "open",
        createdAt: Date.now() - 86400000 * 1,
      },
    ];

    const seedUsers: UserProfile[] = [
      {
        id: "user_seed1",
        phone: "+96894567890",
        name: "Mohammed Al-Siyabi",
        role: "requester",
        createdAt: Date.now() - 86400000 * 15,
      },
      {
        id: "user_seed2",
        phone: "+96895678901",
        name: "Sara Al-Lawati",
        role: "requester",
        createdAt: Date.now() - 86400000 * 10,
      },
      ...brokers,
    ];

    await setList(KEYS.USERS, seedUsers);
    await setList(KEYS.REQUESTS, requests);
    await AsyncStorage.setItem(KEYS.SEEDED, "true");
  },
};
