import { create } from 'zustand'; // Custom hooks manager (Global State)
import { toast } from 'react-toastify'
import api from '../utils/api'

// Create custom hook Zustand
const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    error: null,
    isLoading: false, // Request Async is proccessed or not
    isCheckingAuth: true,
    message: null,

    signup: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`/auth/register`, { name, email, password });
            set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false
            });
            toast.success('Account created successfully! Welcome!');
            return response.data;
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Error signing up";
            set({ error: errorMsg, isLoading: false });
            toast.error(errorMsg);
            throw error;
        }
    },
    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`/auth/login`, { email, password });
            set({
                user: response.data.user,
                isAuthenticated: true,
                error: null,
                isLoading: false,
            });
            toast.success('Logged in successfully!');
            return response.data;
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Error logging in";
            set({
                error: errorMsg,
                isLoading: false,
            });
            toast.error(errorMsg);
            throw error;
        }
    },
    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await api.post(`/auth/logout`);
            set({
                user: null,
                isAuthenticated: false,
                error: null,
                isLoading: false,
            });
            toast.info('Logged out successfully');
        } catch (error) {
            set({
                error: "Error logging out",
                isLoading: false,
            });
            toast.error("Error logging out");
            throw error;
        }
    },
    verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`/auth/verify-email`, { code });
            set({ user: response.data.user, isAuthenticated: true, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error verifying email", isLoading: false });
            throw error;
        }
    },
    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
            const response = await api.get(`/auth/me`);
            set({ user: response.data.user || response.data.user, isAuthenticated: true, isCheckingAuth: false });
            return response.data;
        } catch (error) {
            set({ error: null, isCheckingAuth: false, isAuthenticated: false });
            return null;
        }
    },
    forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`/auth/forgot-password`, { email });
            set({ message: response.data.message, isLoading: false });
            return response.data;
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || "Error sending reset password email",
            });
            throw error;
        }
    },
    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`/auth/reset-password/${token}`, { password });
            set({ message: response.data.message, isLoading: false });
            return response.data;
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || "Error resetting password",
            });
            throw error;
        }
    },
    // Set user directly (for profile updates)
    setUser: (user) => {
        set({ user, isAuthenticated: true });
    },
}))

export default useAuthStore;