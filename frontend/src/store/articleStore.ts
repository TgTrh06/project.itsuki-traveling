import { create } from 'zustand'
import api from '../utils/api'

const useArticleStore = create((set, get) => ({
  articles: [],
  total: 0,
  page: 1,
  pages: 1,
  limit: 10,
  loading: false,
  error: null,

  // Lấy danh sách bài viết
  fetchArticles: async ({ page = 1, limit = 10, destination, author, interest, sort } = {}) => {
    set({ loading: true, error: null })
    try {
      const q = []
      if (destination) q.push(`destination=${destination}`)
      if (author) q.push(`author=${author}`)
      if (interest) q.push(`interest=${interest}`)
      if (sort) q.push(`sort=${sort}`)
      q.push(`page=${page}`)
      q.push(`limit=${limit}`)
      const query = q.length ? `?${q.join('&')}` : ''
      const res = await api.get(`/articles${query}`)
      const { data, total, page: p, pages } = res.data
      set({ articles: data, total, page: p, pages, limit, loading: false })
      return res.data
    } catch (err) {
      set({ error: err, loading: false })
      throw err
    }
  },

  // Lấy top bài viết (views)
  fetchTopArticles: async (limit = 10) => {
    try {
      const res = await api.get(`/articles?sort=views&limit=${limit}`)
      return res.data.data
    } catch (err) {
      console.error("Failed to fetch top articles", err)
      return []
    }
  },

  getArticleBySlug: async (city, slug) => {
    try {
      const res = await api.get(`/articles/${city}/${slug}`)
      return res.data // { article, comments }
    } catch (err) {
      throw err
    }
  },

  // Tạo bài viết mới
  createArticle: async (articleData) => {
    set({ loading: true, error: null })
    try {
      const res = await api.post('/articles', articleData)
      const newArticle = res.data.article
      set((state) => ({
        articles: [newArticle, ...state.articles],
        loading: false
      }))
      return newArticle
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create article', loading: false })
      throw err
    }
  },

  // Cập nhật bài viết
  updateArticle: async (id, updatedData) => {
    set({ loading: true, error: null })
    try {
      const res = await api.put(`/articles/${id}/edit`, updatedData)
      const updated = res.data.article
      set((state) => ({
        articles: state.articles.map((a) => (a._id === id ? updated : a)),
        loading: false
      }))
      return updated
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update article', loading: false })
      throw err
    }
  },

  // Xóa bài viết
  deleteArticle: async (id) => {
    set({ loading: true, error: null })
    try {
      await api.delete(`/articles/${id}`)
      set((state) => ({
        articles: state.articles.filter((a) => a._id !== id),
        loading: false
      }))
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete article', loading: false })
      throw err
    }
  },

  // Lấy chi tiết một bài viết
  getArticleById: async (id) => {
    set({ loading: true, error: null })
    try {
      const res = await api.get(`/articles/${id}`)
      set({ loading: false })
      return res.data.article
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch article', loading: false })
      throw err
    }
  },
  // Toggle Like Article
  likeArticle: async (articleId) => {
    try {
      // Gọi API toggle like
      const res = await api.post(`/articles/${articleId}/like`)

      // Cập nhật số lượng likes trong state articles (Tùy chọn)
      set((state) => ({
        articles: state.articles.map((a) =>
          a._id === articleId
            ? { ...a, meta: { ...a.meta, likesCount: res.data.likesCount } }
            : a
        ),
      }))
      return res.data.likesCount
    } catch (err) {
      console.error(err);
      throw err
    }
  },
}))

export default useArticleStore