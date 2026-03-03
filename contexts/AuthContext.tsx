import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { store } from "@/lib/storage";
import type { UserProfile, UserRole } from "@/lib/types";

const ADMIN_PHONES = ["+96899999999", "+96800000000"];

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (phone: string) => Promise<UserProfile | null>;
  signUp: (phone: string, name: string, role: UserRole, extra?: Partial<UserProfile>) => Promise<UserProfile>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await store.seedData();
      const saved = await store.getCurrentUser();
      if (saved) {
        const fresh = await store.getUserById(saved.id);
        if (fresh && !fresh.disabled) {
          setUser(fresh);
        } else {
          await store.setCurrentUser(null);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return ADMIN_PHONES.includes(user.phone);
  }, [user]);

  const signIn = async (phone: string): Promise<UserProfile | null> => {
    const existing = await store.getUserByPhone(phone);
    if (existing) {
      if (existing.disabled) return null;
      setUser(existing);
      await store.setCurrentUser(existing);
      return existing;
    }
    return null;
  };

  const signUp = async (
    phone: string,
    name: string,
    role: UserRole,
    extra?: Partial<UserProfile>
  ): Promise<UserProfile> => {
    const newUser = await store.createUser({ phone, name, role, ...extra });
    setUser(newUser);
    await store.setCurrentUser(newUser);
    return newUser;
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = await store.updateUser(user.id, updates);
    if (updated) {
      setUser(updated);
      await store.setCurrentUser(updated);
    }
  };

  const signOut = async () => {
    setUser(null);
    await store.setCurrentUser(null);
  };

  const value = useMemo(
    () => ({ user, isLoading, isAdmin, signIn, signUp, updateProfile, signOut }),
    [user, isLoading, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
