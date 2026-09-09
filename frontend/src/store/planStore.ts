import { create } from "zustand";
import useAuthStore from "./authStore";
import api from "../utils/api";
import type { PlanItem } from "../types/models";

interface PlanResponse { plan?: { items?: PlanItem[] } }
interface PlanStore {
  plannedItems: PlanItem[];
  currentUserId: string;
  addItem: (item: PlanItem) => void;
  removeItem: (itemId: string) => void;
  clearPlan: () => void;
  loadForUser: (userId?: string) => void;
}

const storageKeyFor = (userId?: string) => `travel-plan-${userId || "guest"}`;
const userIdOf = (user: { id?: string; _id?: string } | null) => user?.id ?? user?._id ?? "guest";
const isPlanItem = (value: unknown): value is PlanItem =>
  value !== null && typeof value === "object" && "_id" in value && typeof (value as { _id?: unknown })._id === "string";
const readItems = (key: string): PlanItem[] => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isPlanItem) : [];
  } catch { return []; }
};

const initialUserId = userIdOf(useAuthStore.getState().user);

const usePlanStore = create<PlanStore>((set, get) => {
  const persist = () => {
    try { localStorage.setItem(storageKeyFor(get().currentUserId), JSON.stringify(get().plannedItems)); } catch { /* storage is optional */ }
  };
  const saveServerPlan = async (items: PlanItem[]) => {
    try { await api.post<PlanResponse>("/plans", { items }); } catch { /* local persistence remains available */ }
  };
  const deleteServerPlan = async () => { try { await api.delete("/plans"); } catch { /* local persistence remains available */ } };

  return {
    plannedItems: readItems(storageKeyFor(initialUserId)),
    currentUserId: initialUserId,
    addItem: (item) => {
      const items = get().plannedItems;
      if (items.some((entry) => entry._id === item._id)) return;
      const next = [...items, item]; set({ plannedItems: next }); persist();
      if (get().currentUserId !== "guest") void saveServerPlan(next);
    },
    removeItem: (itemId) => {
      const next = get().plannedItems.filter((item) => item._id !== itemId); set({ plannedItems: next }); persist();
      if (get().currentUserId !== "guest") void saveServerPlan(next);
    },
    clearPlan: () => {
      set({ plannedItems: [] }); persist();
      if (get().currentUserId !== "guest") void deleteServerPlan();
    },
    loadForUser: (userId) => {
      const currentUserId = userId || "guest";
      set({ plannedItems: readItems(storageKeyFor(currentUserId)), currentUserId });
    },
  };
});

let lastUserId = initialUserId;
useAuthStore.subscribe((state) => {
  const currentUserId = userIdOf(state.user);
  if (currentUserId === lastUserId) return;
  lastUserId = currentUserId;
  if (currentUserId === "guest") {
    usePlanStore.setState({ plannedItems: readItems(storageKeyFor(currentUserId)), currentUserId });
    return;
  }
  void api.get<PlanResponse>("/plans")
    .then((response) => response.data.plan?.items ?? readItems(storageKeyFor(currentUserId)))
    .catch(() => readItems(storageKeyFor(currentUserId)))
    .then((plannedItems) => {
      localStorage.setItem(storageKeyFor(currentUserId), JSON.stringify(plannedItems));
      usePlanStore.setState({ plannedItems, currentUserId });
    });
});

export default usePlanStore;
