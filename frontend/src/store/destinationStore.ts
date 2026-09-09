import axios from "axios";
import { create } from "zustand";
import api from "../utils/api";
import type { ApiErrorResponse, Destination } from "../types/models";

interface DestinationResponse { data: Destination[]; total: number; page: number; pages: number }
interface DestinationStore {
  destinations: Destination[]; total: number; page: number; pages: number; limit: number; loading: boolean; error: string | null;
  fetchDestinations: (query?: { page?: number; limit?: number }) => Promise<DestinationResponse>;
}

const message = (error: unknown) => axios.isAxiosError<ApiErrorResponse>(error) ? error.response?.data?.message ?? "Failed to fetch destinations" : "Failed to fetch destinations";

const useDestinationStore = create<DestinationStore>((set) => ({
  destinations: [], total: 0, page: 1, pages: 1, limit: 20, loading: false, error: null,
  fetchDestinations: async ({ page = 1, limit = 20 } = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<DestinationResponse>(`/destinations?page=${page}&limit=${limit}`);
      set({ destinations: response.data.data, total: response.data.total, page: response.data.page, pages: response.data.pages, limit, loading: false });
      return response.data;
    } catch (error) { set({ error: message(error), loading: false, destinations: [] }); throw error; }
  },
}));

export default useDestinationStore;
