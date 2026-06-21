import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),
  getters: {
    totalItems: (state) =>
      state.items.reduce((sum, i) => sum + i.quantity, 0),
    totalAmount: (state) =>
      state.items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0)
  },
  actions: {
    initFromStorage() {
      const saved = localStorage.getItem('cart');
      if (saved) {
        try { this.items = JSON.parse(saved); } catch { this.items = []; }
      }
    },
    save() {
      localStorage.setItem('cart', JSON.stringify(this.items));
    },
    addItem(product, quantity = 1) {
      const existing = this.items.find(i => i.product_id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        this.items.push({
          product_id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity
        });
      }
      this.save();
    },
    updateQuantity(productId, quantity) {
      const item = this.items.find(i => i.product_id === productId);
      if (item) {
        item.quantity = Math.max(1, quantity);
        this.save();
      }
    },
    removeItem(productId) {
      this.items = this.items.filter(i => i.product_id !== productId);
      this.save();
    },
    clear() {
      this.items = [];
      this.save();
    }
  }
});