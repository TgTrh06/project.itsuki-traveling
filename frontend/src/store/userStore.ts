import { create } from 'zustand'
import api from '../utils/api'

const useUserStore = create((set) => ({
  users: [],
  userCount: 0,
  loading: false,
  error: null,

  // Lấy danh sách người dùng
  fetchUsers: async () => {
    set({ loading: true, error: null })
    try {
      const res = await api.get('/admin/users')
      set({ users: res.data.users || [], loading: false })
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch users',
        loading: false,
      })
    }
  },

  // Lấy tổng số người dùng
  fetchUserCount: async () => {
    try {
      const res = await api.get('/admin/users/count')
      set({ userCount: res.data.count || 0 })
    } catch (err) {
      console.error('Failed to fetch user count:', err)
    }
  },

  // Xóa người dùng
  deleteUser: async (id) => {
    set({ loading: true, error: null })
    try {
      await api.delete(`/admin/users/${id}`)
      set((state) => ({
        users: state.users.filter((u) => u._id !== id),
        loading: false,
      }))
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to delete user',
        loading: false,
      })
    }
  },

  // Cập nhật người dùng
  updateUser: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const res = await api.put(`/admin/users/${id}`, data)
      set((state) => ({
        users: state.users.map((u) => (u._id === id ? res.data.user : u)),
        loading: false,
      }))
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to update user',
        loading: false,
      })
    }
  },
}))

export default useUserStore;