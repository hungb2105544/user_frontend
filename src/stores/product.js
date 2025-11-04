import { defineStore } from "pinia";
import productService from "@/services/product.service";

export const useProductStore = defineStore("product", {
  state: () => ({
    products: [],
  }),

  actions: {
    async fetchProducts() {
      try {
        const response = await productService.getAllProducts();
        this.products = response.data;
        console.log("Products fetched and stored:", this.products);
        return this.products;
      } catch (error) {
        console.error("Error fetching products in store:", error);
        throw error; // Re-throw to be handled by the component
      }
    },

    async fetchProductById(id) {
      try {
        const response = await productService.getProductById(id);
        console.log(`Product with id ${id} fetched:`, response.data);
        return response.data; // Return data directly to the component
      } catch (error) {
        console.error(`Error fetching product with id ${id}:`, error);
        throw error;
      }
    },
  },
});
