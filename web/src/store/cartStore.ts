import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { safeArray } from '../lib/api-helpers';

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  grindType?: string;
  weight?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  get total(): number;
  get itemCount(): number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = safeArray<CartItem>(get().items);
        const existing = items.find(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        );
        if (existing) {
          set((state) => ({
            items: safeArray<CartItem>(state.items).map((i) =>
              i.productId === item.productId && i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          }));
        } else {
          set((state) => ({ items: [...safeArray<CartItem>(state.items), item] }));
        }
      },
      removeItem: (id) =>
        set((state) => ({ items: safeArray<CartItem>(state.items).filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? safeArray<CartItem>(state.items).filter((i) => i.id !== id)
            : safeArray<CartItem>(state.items).map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      clearCart: () => set({ items: [] }),
      get total() {
        return safeArray<CartItem>(get().items).reduce((sum, i) => sum + i.price * i.quantity, 0);
      },
      get itemCount() {
        return safeArray<CartItem>(get().items).reduce((sum, i) => sum + i.quantity, 0);
      },
    }),
    { name: 'kahvekseni-cart' }
  )
);
