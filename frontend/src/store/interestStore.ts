import { create } from 'zustand'
import api from '../utils/api'

const useInterestStore = create((set, get) => ({
  interests: [],
  selectedInterest: null,
  articles: [],
  page: 1,
  pages: 1,
  loading: false,
  error: null,

    fetchInterests: async () => {
    set({ loading: true, error: null })
    try {
      const res = await api.get('/interests')
      console.log('Interest API response:', res.data)
      set({ interests: res.data, loading: false })
      return res.data
    } catch (err) {
      console.error('Error fetching interests:', err)
      set({ error: err, loading: false, interests: [] })
      throw err
    }
  },

  setSelectedInterest: (interest) => {
    set({ selectedInterest: interest })
  },

  fetchArticlesByInterest: async (interestSlug, { page = 1, limit = 10 } = {}) => {
    set({ loading: true, error: null })
    try {
      const res = await api.get(`/articles?interest=${interestSlug}&page=${page}&limit=${limit}`)
      const { data, total, pages } = res.data
      set({ articles: data, page, pages, loading: false })
      return res.data
    } catch (err) {
      set({ error: err, loading: false })
      throw err
    }
  }
}))

export default useInterestStore
