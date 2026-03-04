import { create } from "zustand";
import type { Customer } from "@/types";

interface CustomerState {
  selectedCustomer: Customer | null;
  searchResults: Customer[];
  
  setSelectedCustomer: (customer: Customer | null) => void;
  setSearchResults: (results: Customer[]) => void;
  clearCustomer: () => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  selectedCustomer: null,
  searchResults: [],
  
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  setSearchResults: (results) => set({ searchResults: results }),
  clearCustomer: () => set({ selectedCustomer: null, searchResults: [] }),
}));