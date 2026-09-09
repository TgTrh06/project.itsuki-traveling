import axios from "axios";
import { create } from "zustand";
import api from "../utils/api";
import type { ApiErrorResponse, Article, Interest } from "../types/models";

interface ArticleListResponse { data: Article[]; total: number; pages: number }
interface InterestStore {
  interests: Interest[]; selectedInterest: Interest | null; articles: Article[]; page: number; pages: number; loading: boolean; error: string | null;
  fetchInterests: () => Promise<Interest[]>;
  setSelectedInterest: (interest: Interest | null) => void;
  fetchArticlesByInterest: (slug: string, options?: { page?: number; limit?: number }) => Promise<ArticleListResponse>;
}

const errorMessage = (error: unknown, fallback: string) => axios.isAxiosError<ApiErrorResponse>(error) ? error.response?.data?.message ?? fallback : fallback;

const useInterestStore = create<InterestStore>((set) => ({
  interests: [], selectedInterest: null, articles: [], page: 1, pages: 1, loading: false, error: null,
  fetchInterests: async () => {
    set({ loading: true, error: null });
    try { const response = await api.get<Interest[]>("/interests"); set({ interests: response.data, loading: false }); return response.data; }
    catch (error) { set({ error: errorMessage(error, "Failed to fetch interests"), loading: false, interests: [] }); throw error; }
  },
  setSelectedInterest: (interest) => set({ selectedInterest: interest }),
  fetchArticlesByInterest: async (slug, { page = 1, limit = 10 } = {}) => {
    set({ loading: true, error: null });
    try { const response = await api.get<ArticleListResponse>(`/articles?interest=${encodeURIComponent(slug)}&page=${page}&limit=${limit}`); set({ articles: response.data.data, page, pages: response.data.pages, loading: false }); return response.data; }
    catch (error) { set({ error: errorMessage(error, "Failed to fetch articles"), loading: false }); throw error; }
  },
}));

export default useInterestStore;
