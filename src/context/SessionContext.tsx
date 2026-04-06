"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserSession {
  username: string;
  role: string;
  namaLengkap: string;
}

interface SessionContextType {
  user: UserSession | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAdmin: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("_slm");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse session", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", username, password }),
      });
      const result = await res.json();
      if (result.success) {
        const userData = result.data || result;
        const sessionData: UserSession = {
          username: userData.username,
          role: userData.role,
          namaLengkap: userData.namaLengkap,
        };
        setUser(sessionData);
        localStorage.setItem("_slm", JSON.stringify(sessionData));
        return { success: true };
      } else {
        return { success: false, message: result.message || "Login gagal" };
      }
    } catch (e: any) {
      return { success: false, message: e.message || "Kesalahan jaringan" };
    }
  };

  const logout = () => {
    if (confirm("Yakin ingin keluar?")) {
      setUser(null);
      localStorage.removeItem("_slm");
      router.push("/login");
    }
  };

  const isAdmin = String(user?.role || "").toLowerCase() === "admin";

  return (
    <SessionContext.Provider value={{ user, isLoading, login, logout, isAdmin }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
