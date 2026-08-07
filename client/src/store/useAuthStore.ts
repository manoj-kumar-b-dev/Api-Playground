import { create } from "zustand";

interface User {
  id: string,
  _id: string,
  email: string,
  name: string
}

interface AuthState {
  user: User | null,
  token: string | null,
  isLoading: Boolean,
  isAuthenticated: Boolean,

  login: (user: User, token: string) => void,
  logout: () => void,
  setLoading: (isLoading: Boolean) => void,
  setUser: (user: User | null) => void
}
const initialToken = localStorage.getItem("token");

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: initialToken,
  isLoading: false,
  isAuthenticated: !!initialToken,
  login: (user: User, token: string) => {
    localStorage.setItem("token", token)
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: true
    })
  },
  logout: () => {
    localStorage.removeItem("token"),
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      })
  },
  setLoading: (isLoading: Boolean) => {
    set({ isLoading })
  },
  setUser: (user: User | null) => {
    set({ user })
  }
}))
