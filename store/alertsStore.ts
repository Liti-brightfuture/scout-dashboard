import { create } from "zustand";

import type { Alert } from "@/types/alerts";

interface AlertsStore {
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
}

export const useAlertsStore = create<AlertsStore>((set) => ({
  alerts: [],
  setAlerts: (alerts) => set({ alerts }),
}));
