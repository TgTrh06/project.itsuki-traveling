// store/commentStore.js

import { create } from 'zustand'
import api from '../utils/api'

const useCommentStore = create((set, get) => ({
    comments: [],
    loading: false,
    error: null,

    // Lấy tất cả comments cho một bài viết
    fetchComments: async (articleId) => {
        set({ loading: true, error: null })
        try {
            const res = await api.get(`/comments/article/${articleId}`)
            set({ comments: res.data, loading: false })
            return res.data
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to fetch comments', loading: false })
            throw err
        }
    },

    // Thêm comment mới
    addComment: async (articleId, content) => {
        set({ loading: true, error: null })
        try {
            const res = await api.post(`/comments/${articleId}`, { content })
            const newComment = res.data.comment
            
            // Thêm comment mới vào đầu danh sách comments hiện tại
            set((state) => ({
                comments: [newComment, ...state.comments],
                loading: false
            }))
            return newComment
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to add comment', loading: false })
            throw err
        }
    },

    // Xóa comment
    deleteComment: async (commentId) => {
        set({ loading: true, error: null })
        try {
            await api.delete(`/comments/${commentId}`)
            
            // Lọc bỏ comment khỏi state
            set((state) => ({
                comments: state.comments.filter((c) => c._id !== commentId),
                loading: false
            }))
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to delete comment', loading: false })
            throw err
        }
    },
}))

export default useCommentStore;