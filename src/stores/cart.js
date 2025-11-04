import { defineStore } from "pinia";
import cartService from "@/services/cart.service";

export const useCartStore = defineStore("cart", {
  state: () => ({
    cartItems: [],
    loading: false,
  }),

  getters: {
    cartCount: (state) => {
      return state.cartItems.reduce((total, item) => total + item.quantity, 0);
    },
    cartTotal: (state) => {
      return state.cartItems.reduce((total, item) => {
        return total + item.unit_price * item.quantity;
      }, 0);
    },
  },

  actions: {
    async fetchCart() {
      this.loading = true;
      try {
        const response = await cartService.getCart();
        this.cartItems = response.data;
      } catch (error) {
        console.error("Error fetching cart:", error);
        // If unauthorized, the auth store/interceptor should handle logout.
        // For other errors, we clear the cart.
        this.cartItems = [];
      } finally {
        this.loading = false;
      }
    },

    async addToCart(item) {
      try {
        await cartService.addToCart(item);
        // After adding, refresh the whole cart to get updated totals and counts
        await this.fetchCart();
      } catch (error) {
        console.error("Error adding to cart:", error);
        throw error;
      }
    },

    async updateCartItem(itemId, quantity) {
      await cartService.updateCartItem(itemId, { quantity });
      // Refresh cart for consistency
      await this.fetchCart();
    },

    async removeFromCart(itemId) {
      await cartService.removeFromCart(itemId);
      // Optimistically remove from local state for faster UI update
      this.cartItems = this.cartItems.filter((item) => item.id !== itemId);
      // No need to fetch again if we update locally
    },
  },
});
