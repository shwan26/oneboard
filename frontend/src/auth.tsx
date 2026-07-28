import React, { createContext, useContext, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("oneboard_user");
    return raw ? JSON.parse(raw) : null;
  });

  function login(token: string, user: User) {
    localStorage.setItem("oneboard_token", token);
    localStorage.setItem("oneboard_user", JSON.stringify(user));
    setUser(user);
  }

  function logout() {
    localStorage.removeItem("oneboard_token");
    localStorage.removeItem("oneboard_user");
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}