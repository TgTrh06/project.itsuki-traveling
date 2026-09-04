import { create } from 'zustand';
import useAuthStore from './authStore';
import api from '../utils/api'

// Keys in localStorage will be: travel-plan-<userId> or travel-plan-guest
const storageKeyFor = (userId) => `travel-plan-${userId || 'guest'}`;

const usePlanStore = create((set, get) => {
    // Initialize from current auth user
    const authUser = useAuthStore.getState().user;
    const initialKey = storageKeyFor(authUser?.id || authUser?._id);
    let initialItems = [];
    try {
        const raw = localStorage.getItem(initialKey);
        if (raw) initialItems = JSON.parse(raw);
    } catch (e) {
        initialItems = [];
    }

    // Subscribe to auth changes to switch plan context when user logs in/out
    useAuthStore.subscribe(
        (s) => s.user,
        (newUser) => {
            (async () => {
                const uid = newUser?.id || newUser?._id || 'guest';
                const key = storageKeyFor(uid);
                try {
                    if (uid !== 'guest') {
                        // Logged in: prefer server plan, fallback to per-user localStorage
                        try {
                            const res = await api.get('/plans');
                            const serverPlan = res.data?.plan?.items || [];
                            localStorage.setItem(key, JSON.stringify(serverPlan));
                            set({ plannedItems: serverPlan, currentUserId: uid });
                        } catch (err) {
                            const raw = localStorage.getItem(key);
                            const items = raw ? JSON.parse(raw) : [];
                            set({ plannedItems: items, currentUserId: uid });
                        }
                    } else {
                        // Logged out: load guest plan
                        const raw = localStorage.getItem(key);
                        const items = raw ? JSON.parse(raw) : [];
                        set({ plannedItems: items, currentUserId: uid });
                    }
                } catch (e) {
                    set({ plannedItems: [], currentUserId: uid });
                }
            })();
        }
    );

    // helper to persist current plannedItems for current user
    const persistForCurrentUser = () => {
        const uid = get().currentUserId || 'guest';
        const key = storageKeyFor(uid);
        try {
            localStorage.setItem(key, JSON.stringify(get().plannedItems || []));
        } catch (e) {
            // ignore
        }
    };

        // server sync helpers
        const fetchServerPlan = async () => {
            try {
                const res = await api.get('/plans')
                return res.data?.plan?.items || []
            } catch (err) {
                return null
            }
        }

        const saveServerPlan = async (items) => {
            try {
                const res = await api.post('/plans', { items })
                return res.data?.plan || null
            } catch (err) {
                return null
            }
        }

        const deleteServerPlan = async () => {
            try {
                await api.delete('/plans')
                return true
            } catch (err) {
                return false
            }
        }

    return {
        plannedItems: initialItems,
        currentUserId: authUser?.id || authUser?._id || 'guest',

        addItem: (item) => {
            const items = get().plannedItems;
            if (items.some((i) => i._id === item._id)) return; // Prevent duplicates
            const next = [...items, item];
            set({ plannedItems: next });
            persistForCurrentUser();
            // sync to server if logged in
            const uid = get().currentUserId || 'guest'
            if (uid !== 'guest') saveServerPlan(next).catch(() => {})
        },

        removeItem: (itemId) => {
            const next = get().plannedItems.filter((i) => i._id !== itemId);
            set({ plannedItems: next });
            persistForCurrentUser();
            const uid = get().currentUserId || 'guest'
            if (uid !== 'guest') saveServerPlan(next).catch(() => {})
        },

        clearPlan: () => {
            set({ plannedItems: [] });
            persistForCurrentUser();
            const uid = get().currentUserId || 'guest'
            if (uid !== 'guest') deleteServerPlan().catch(() => {})
        },

        // Explicitly load plan for a user id (optional)
        loadForUser: (userId) => {
            const uid = userId || 'guest';
            const key = storageKeyFor(uid);
            try {
                const raw = localStorage.getItem(key);
                const items = raw ? JSON.parse(raw) : [];
                set({ plannedItems: items, currentUserId: uid });
            } catch (e) {
                set({ plannedItems: [], currentUserId: uid });
            }
        },
    };
});

export default usePlanStore;
