import axios from "axios";
import { create } from "zustand";
import api from "../utils/api";
import type { ApiErrorResponse, Article } from "../types/models";

interface ArticleListResponse { data: Article[]; total: number; page: number; pages: number }
interface ArticleResponse { article: Article }
interface ArticleDetailResponse { article: Article; comments: unknown[] }
interface ArticleQuery { page?: number; limit?: number; destination?: string; author?: string; interest?: string; sort?: "views" }
interface ArticleStore {
  articles: Article[]; total: number; page: number; pages: number; limit: number; loading: boolean; error: string | null;
  fetchArticles: (query?: ArticleQuery) => Promise<ArticleListResponse>;
  fetchTopArticles: (limit?: number) => Promise<Article[]>;
  getArticleBySlug: (city: string, slug: string) => Promise<ArticleDetailResponse>;
  createArticle: (articleData: FormData | Partial<Article>) => Promise<Article>;
  updateArticle: (id: string, updatedData: FormData | Partial<Article>) => Promise<Article>;
  deleteArticle: (id: string) => Promise<void>;
  getArticleById: (id: string) => Promise<Article>;
  likeArticle: (articleId: string) => Promise<number>;
}

const errorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError<ApiErrorResponse>(error) ? error.response?.data?.message ?? fallback : fallback;

const useArticleStore = create<ArticleStore>((set) => ({
  articles: [], total: 0, page: 1, pages: 1, limit: 10, loading: false, error: null,
  fetchArticles: async ({ page = 1, limit = 10, destination, author, interest, sort } = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (destination) params.set("destination", destination);
      if (author) params.set("author", author);
      if (interest) params.set("interest", interest);
      if (sort) params.set("sort", sort);
      const response = await api.get<ArticleListResponse>(`/articles?${params.toString()}`);
      const data = response.data;
      set({ articles: data.data, total: data.total, page: data.page, pages: data.pages, limit, loading: false });
      return data;
    } catch (error) { set({ error: errorMessage(error, "Failed to fetch articles"), loading: false }); throw error; }
  },
  fetchTopArticles: async (limit = 10) => {
    try { const response = await api.get<ArticleListResponse>(`/articles?sort=views&limit=${limit}`); return response.data.data; }
    catch { return []; }
  },
  getArticleBySlug: async (city, slug) => (await api.get<ArticleDetailResponse>(`/articles/${city}/${slug}`)).data,
  createArticle: async (articleData) => {
    set({ loading: true, error: null });
    try { const response = await api.post<ArticleResponse>("/articles", articleData); const article = response.data.article; set((state) => ({ articles: [article, ...state.articles], loading: false })); return article; }
    catch (error) { set({ error: errorMessage(error, "Failed to create article"), loading: false }); throw error; }
  },
  updateArticle: async (id, updatedData) => {
    set({ loading: true, error: null });
    try { const response = await api.put<ArticleResponse>(`/articles/${id}/edit`, updatedData); const article = response.data.article; set((state) => ({ articles: state.articles.map((entry) => entry._id === id ? article : entry), loading: false })); return article; }
    catch (error) { set({ error: errorMessage(error, "Failed to update article"), loading: false }); throw error; }
  },
  deleteArticle: async (id) => {
    set({ loading: true, error: null });
    try { await api.delete(`/articles/${id}`); set((state) => ({ articles: state.articles.filter((article) => article._id !== id), loading: false })); }
    catch (error) { set({ error: errorMessage(error, "Failed to delete article"), loading: false }); throw error; }
  },
  getArticleById: async (id) => {
    set({ loading: true, error: null });
    try { const response = await api.get<ArticleResponse>(`/articles/${id}`); set({ loading: false }); return response.data.article; }
    catch (error) { set({ error: errorMessage(error, "Failed to fetch article"), loading: false }); throw error; }
  },
  likeArticle: async (articleId) => {
    try {
      const response = await api.post<{ likesCount: number }>(`/articles/${articleId}/like`);
      set((state) => ({ articles: state.articles.map((article) => article._id === articleId ? { ...article, meta: { ...article.meta, likesCount: response.data.likesCount } } : article) }));
      return response.data.likesCount;
    } catch (error) { throw error; }
  },
}));

export default useArticleStore;
