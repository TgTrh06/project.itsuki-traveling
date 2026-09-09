import axios from "axios";
import { create } from "zustand";
import { toast } from "react-toastify";
import api from "../utils/api";
import type { ApiErrorResponse, User } from "../types/models";

interface AuthResponse { message?: string; user: User }
interface MessageResponse { message?: string }

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  error: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  message: string | null;
  signup: (name: string, email: string, password: string) => Promise<AuthResponse>;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  verifyEmail: (code: string) => Promise<AuthResponse>;
  checkAuth: () => Promise<AuthResponse | null>;
  forgotPassword: (email: string) => Promise<MessageResponse>;
  resetPassword: (token: string, password: string) => Promise<MessageResponse>;
  setUser: (user: User) => void;
}

const errorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError<ApiErrorResponse>(error) ? error.response?.data?.message ?? fallback : fallback;

const useAuthStore = create<AuthStore>((set) => ({
  user: null, isAuthenticated: false, error: null, isLoading: false, isCheckingAuth: true, message: null,
  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<AuthResponse>("/auth/register", { name, email, password });
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
      toast.success("Account created successfully! Welcome!");
      return response.data;
    } catch (error) {
      const message = errorMessage(error, "Error signing up"); set({ error: message, isLoading: false }); toast.error(message); throw error;
    }
  },
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<AuthResponse>("/auth/login", { email, password });
      set({ user: response.data.user, isAuthenticated: true, error: null, isLoading: false });
      toast.success("Logged in successfully!"); return response.data;
    } catch (error) {
      const message = errorMessage(error, "Error logging in"); set({ error: message, isLoading: false }); toast.error(message); throw error;
    }
  },
  logout: async () => {
    set({ isLoading: true, error: null });
    try { await api.post("/auth/logout"); set({ user: null, isAuthenticated: false, error: null, isLoading: false }); toast.info("Logged out successfully"); }
    catch (error) { set({ error: "Error logging out", isLoading: false }); toast.error("Error logging out"); throw error; }
  },
  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });
    try { const response = await api.post<AuthResponse>("/auth/verify-email", { code }); set({ user: response.data.user, isAuthenticated: true, isLoading: false }); return response.data; }
    catch (error) { set({ error: errorMessage(error, "Error verifying email"), isLoading: false }); throw error; }
  },
  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try { const response = await api.get<AuthResponse>("/auth/me"); set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false }); return response.data; }
    catch { set({ error: null, isCheckingAuth: false, isAuthenticated: false }); return null; }
  },
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try { const response = await api.post<MessageResponse>("/auth/forgot-password", { email }); set({ message: response.data.message ?? null, isLoading: false }); return response.data; }
    catch (error) { set({ isLoading: false, error: errorMessage(error, "Error sending reset password email") }); throw error; }
  },
  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null });
    try { const response = await api.post<MessageResponse>(`/auth/reset-password/${token}`, { password }); set({ message: response.data.message ?? null, isLoading: false }); return response.data; }
    catch (error) { set({ isLoading: false, error: errorMessage(error, "Error resetting password") }); throw error; }
  },
  setUser: (user) => set({ user, isAuthenticated: true }),
}));

export default useAuthStore;
