import { create } from "zustand";
import type { User, CashierSession, Branch, Terminal } from "@/types";

interface AuthState {
  isInitialized: boolean;
  isAuthenticated: boolean;
  terminal: Terminal | null;
  branch: Branch | null;
  cashier: User | null;
  session: CashierSession | null;
  
  setInitialized: (initialized: boolean) => void;
  setTerminal: (terminal: Terminal | null) => void;
  setBranch: (branch: Branch | null) => void;
  login: (cashier: User, session: CashierSession) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isInitialized: false,
  isAuthenticated: false,
  terminal: null,
  branch: null,
  cashier: null,
  session: null,
  
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  
  setTerminal: (terminal) => set({ terminal }),
  
  setBranch: (branch) => set({ branch }),
  
  login: (cashier, session) =>
    set({
      isAuthenticated: true,
      cashier,
      session,
    }),
  
  logout: () =>
    set({
      isAuthenticated: false,
      cashier: null,
      session: null,
    }),
}));