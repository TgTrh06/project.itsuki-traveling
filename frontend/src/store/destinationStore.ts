import { create } from 'zustand'
import api from '../utils/api'

const useDestinationStore = create((set, get) => ({
  destinations: [],
  total: 0,
  page: 1,
  pages: 1,
  limit: 20,
  loading: false,
  error: null,

    fetchDestinations: async ({ page = 1, limit = 20 } = {}) => {
    set({ loading: true, error: null })
    try {
      const res = await api.get(`/destinations?page=${page}&limit=${limit}`)
      console.log('Destination API response:', res.data)
      const { data, total, page: p, pages } = res.data
      set({ destinations: data, total, page: p, pages, limit, loading: false })
      return res.data
    } catch (err) {
      console.error('Error fetching destinations:', err)
      set({ error: err, loading: false, destinations: [] })
      throw err
    }
  }
}))

export default useDestinationStore
