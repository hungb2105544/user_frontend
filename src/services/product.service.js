import apiClient from "./api";

class ProductService {
  getAllProducts() {
    return apiClient.get("/products");
  }

  getProductById(id) {
    return apiClient.get(`/products/${id}`);
  }
}

export default new ProductService();
