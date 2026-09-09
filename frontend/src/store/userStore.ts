import axios from "axios";
import { create } from "zustand";
import api from "../utils/api";
import type { ApiErrorResponse, User } from "../types/models";

interface UserStore {
  users: User[]; userCount: number; loading: boolean; error: string | null;
  fetchUsers: () => Promise<void>;
  fetchUserCount: () => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateUser: (id: string, data: Partial<Pick<User, "name" | "email" | "role">>) => Promise<void>;
}

const errorMessage = (error: unknown, fallback: string) => axios.isAxiosError<ApiErrorResponse>(error) ? error.response?.data?.message ?? fallback : fallback;

const useUserStore = create<UserStore>((set) => ({
  users: [], userCount: 0, loading: false, error: null,
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try { const response = await api.get<{ users?: User[] }>("/admin/users"); set({ users: response.data.users ?? [], loading: false }); }
    catch (error) { set({ error: errorMessage(error, "Failed to fetch users"), loading: false }); }
  },
  fetchUserCount: async () => {
    try { const response = await api.get<{ count?: number }>("/admin/users/count"); set({ userCount: response.data.count ?? 0 }); }
    catch { /* a counter failure does not invalidate the current list */ }
  },
  deleteUser: async (id) => {
    set({ loading: true, error: null });
    try { await api.delete(`/admin/users/${id}`); set((state) => ({ users: state.users.filter((user) => user._id !== id && user.id !== id), loading: false })); }
    catch (error) { set({ error: errorMessage(error, "Failed to delete user"), loading: false }); }
  },
  updateUser: async (id, data) => {
    set({ loading: true, error: null });
    try { const response = await api.put<{ user: User }>(`/admin/users/${id}`, data); set((state) => ({ users: state.users.map((user) => user._id === id || user.id === id ? response.data.user : user), loading: false })); }
    catch (error) { set({ error: errorMessage(error, "Failed to update user"), loading: false }); }
  },
}));

export default useUserStore;
