import { create } from "zustand";
import { api } from "../service/api";

interface User {
  id?: string;
  _id?: string;
  email: string;
  name: string;
  avatar?: string;
  authProvider?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
}

const initialToken = localStorage.getItem("token");
const initialUserStr = localStorage.getItem("user");
let initialUser: User | null = null;

if (initialUserStr) {
  try {
    initialUser = JSON.parse(initialUserStr);
  } catch {
    initialUser = null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  token: initialToken,
  isLoading: false,
  isAuthenticated: !!initialToken,
  login: (user: User, token: string) => {
    localStorage.setItem("token", token);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },
  setUser: (user: User | null) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
    set({ user });
  },
  fetchUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await api.get("/users/me");
      if (res.data?.success && res.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        set({ user: res.data.user, isAuthenticated: true });
      }
    } catch (err) {
      console.error("Failed to fetch user profile", err);
    }
  },
}));

