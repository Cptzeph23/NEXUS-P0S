import { create } from "zustand";
import type { CartItem, CartTotals, PaymentDetails } from "@/types";
import { calcCartTotals, calcLineTotal, calcLineTax } from "@/lib/utils";

interface CartState {
  items: CartItem[];
  discount: number;
  customer: { id: string; name: string } | null;
  note: string;

  addItem: (product: {
    id: string;
    barcode: string;
    name: string;
    price: number;
    taxRate: number;
  }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  updateDiscount: (productId: string, discount: number) => void;
  setCartDiscount: (discount: number) => void;
  setNote: (note: string) => void;
  getTotals: () => CartTotals;
  clear: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: 0,
  customer: null,
  note: "",

  addItem: (product) => {
    const { items } = get();
    const existing = items.find((i) => i.productId === product.id);

    if (existing) {
      set({
        items: items.map((i) =>
          i.productId === product.id
            ? {
                ...i,
                qty: i.qty + 1,
                lineTotal: calcLineTotal(i.price, i.qty + 1, i.discount),
                lineTax: calcLineTax(
                  calcLineTotal(i.price, i.qty + 1, i.discount),
                  i.taxRate
                ),
              }
            : i
        ),
      });
    } else {
      const newItem: CartItem = {
        productId: product.id,
        barcode: product.barcode,
        name: product.name,
        price: product.price,
        qty: 1,
        discount: 0,
        taxRate: product.taxRate,
        lineTotal: product.price,
        lineTax: calcLineTax(product.price, product.taxRate),
      };
      set({ items: [...items, newItem] });
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.productId !== productId) });
  },

  updateQuantity: (productId, qty) => {
    if (qty <= 0) {
      get().removeItem(productId);
      return;
    }

    set({
      items: get().items.map((i) =>
        i.productId === productId
          ? {
              ...i,
              qty,
              lineTotal: calcLineTotal(i.price, qty, i.discount),
              lineTax: calcLineTax(
                calcLineTotal(i.price, qty, i.discount),
                i.taxRate
              ),
            }
          : i
      ),
    });
  },

  updateDiscount: (productId, discount) => {
    set({
      items: get().items.map((i) =>
        i.productId === productId
          ? {
              ...i,
              discount: Math.min(discount, 100),
              lineTotal: calcLineTotal(i.price, i.qty, discount),
              lineTax: calcLineTax(
                calcLineTotal(i.price, i.qty, discount),
                i.taxRate
              ),
            }
          : i
      ),
    });
  },

  setCartDiscount: (discount) => {
    set({ discount: Math.min(discount, 100) });
  },

  setNote: (note) => {
    set({ note });
  },

  getTotals: () => {
    return calcCartTotals(get().items, get().discount);
  },

  clear: () => {
    set({ items: [], discount: 0, customer: null, note: "" });
  },
}));