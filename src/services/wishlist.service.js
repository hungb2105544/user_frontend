import apiClient from "./api";

class WishlistService {
  getWishlist() {
    return apiClient.get("/wishlists");
  }

  addToWishlist(data) {
    // data should be { product_id: ... }
    return apiClient.post("/wishlist", data);
  }

  removeFromWishlist(productId) {
    return apiClient.delete(`/wishlist/${productId}`);
  }
}

export default new WishlistService();
