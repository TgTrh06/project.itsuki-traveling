import axios from "axios";
import { create } from "zustand";
import api from "../utils/api";
import type { ApiErrorResponse, Comment } from "../types/models";

interface CommentStore {
  comments: Comment[]; loading: boolean; error: string | null;
  fetchComments: (articleId: string) => Promise<Comment[]>;
  addComment: (articleId: string, content: string) => Promise<Comment>;
  deleteComment: (commentId: string) => Promise<void>;
}

const errorMessage = (error: unknown, fallback: string) => axios.isAxiosError<ApiErrorResponse>(error) ? error.response?.data?.message ?? fallback : fallback;

const useCommentStore = create<CommentStore>((set) => ({
  comments: [], loading: false, error: null,
  fetchComments: async (articleId) => {
    set({ loading: true, error: null });
    try { const response = await api.get<Comment[]>(`/comments/article/${articleId}`); set({ comments: response.data, loading: false }); return response.data; }
    catch (error) { set({ error: errorMessage(error, "Failed to fetch comments"), loading: false }); throw error; }
  },
  addComment: async (articleId, content) => {
    set({ loading: true, error: null });
    try { const response = await api.post<{ comment: Comment }>(`/comments/${articleId}`, { content }); set((state) => ({ comments: [response.data.comment, ...state.comments], loading: false })); return response.data.comment; }
    catch (error) { set({ error: errorMessage(error, "Failed to add comment"), loading: false }); throw error; }
  },
  deleteComment: async (commentId) => {
    set({ loading: true, error: null });
    try { await api.delete(`/comments/${commentId}`); set((state) => ({ comments: state.comments.filter((comment) => comment._id !== commentId), loading: false })); }
    catch (error) { set({ error: errorMessage(error, "Failed to delete comment"), loading: false }); throw error; }
  },
}));

export default useCommentStore;
