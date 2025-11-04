import apiClient from "./api";

class CartService {
  getCart() {
    return apiClient.get("/cart");
  }

  addToCart(item) {
    // item should be { product_id, variant_id, quantity }
    return apiClient.post("/cart", item);
  }

  updateCartItem(itemId, quantity) {
    return apiClient.put(`/cart/${itemId}`, { quantity });
  }

  removeFromCart(itemId) {
    return apiClient.delete(`/cart/${itemId}`);
  }
}

export default new CartService();
