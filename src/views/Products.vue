<template>
  <div class="products-page">
    <div class="container">
      <h1 class="page-title">Tất cả sản phẩm</h1>

      <!-- TODO: Add filters, sorting, and search bar here -->

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải sản phẩm...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p>Đã xảy ra lỗi khi tải sản phẩm.</p>
        <button @click="fetchData" class="btn-retry">Thử lại</button>
      </div>

      <div v-else-if="products.length === 0" class="empty-state">
        <h2>Không tìm thấy sản phẩm nào.</h2>
        <p>Vui lòng quay lại sau hoặc thử tìm kiếm với từ khóa khác.</p>
      </div>

      <div v-else class="product-grid">
        <ProductCard 
          v-for="product in products" 
          :key="product.id" 
          :product="product"
        />
      </div>

      <!-- TODO: Add pagination component here -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useProductStore } from '@/stores/product';
import ProductCard from '@/components/product/ProductCard.vue';

const productStore = useProductStore();

const loading = ref(false);
const error = ref(null);

const products = computed(() => productStore.products);

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Fetch products if they are not already in the store
    if (productStore.products.length === 0) {
      await productStore.fetchProducts();
    }
  } catch (err) {
    console.error("Failed to fetch products:", err);
    error.value = "Không thể tải sản phẩm. Vui lòng thử lại sau.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.products-page {
  padding: 40px 0;
  min-height: calc(100vh - 200px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 32px;
  text-align: center;
  margin-bottom: 40px;
  color: #111827;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
}

.loading, .error-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-retry {
  display: inline-block;
  padding: 10px 25px;
  background: #2563eb;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.2s;
  border: none;
  cursor: pointer;
  margin-top: 15px;
}

.btn-retry:hover {
  background: #1d4ed8;
}
</style>