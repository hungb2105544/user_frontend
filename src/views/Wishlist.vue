<template>
  <div class="wishlist-page">
    <div class="container">
      <h1 class="page-title">Danh sách yêu thích</h1>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải danh sách yêu thích...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <h2>Đã xảy ra lỗi</h2>
        <p>{{ error }}</p>
        <button @click="fetchWishlist" class="btn-retry">Thử lại</button>
      </div>

      <div v-else-if="wishlistItems.length === 0" class="empty-state">
        <div class="empty-icon">❤️</div>
        <h2>Danh sách yêu thích trống</h2>
        <p>Lưu lại những sản phẩm bạn yêu thích để xem lại sau.</p>
        <RouterLink to="/products" class="btn-primary">Khám phá sản phẩm</RouterLink>
      </div>

      <div v-else class="product-grid">
        <ProductCard 
          v-for="item in wishlistItems" 
          :key="item.product_id" 
          :product="item.products"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import ProductCard from '@/components/product/ProductCard.vue';
import wishlistService from '@/services/wishlist.service'; // Assuming you have this service

const toast = useToast();

const loading = ref(true);
const error = ref(null);
const wishlistItems = ref([]);

const fetchWishlist = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await wishlistService.getWishlist();
    wishlistItems.value = response.data;
  } catch (err) {
    error.value = 'Không thể tải danh sách yêu thích. Vui lòng thử lại.';
    toast.error(error.value);
    console.error('Failed to fetch wishlist:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchWishlist();
});
</script>

<style scoped>
.wishlist-page {
  padding: 40px 0;
  min-height: calc(100vh - 200px);
  background: #f9fafb;
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

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
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

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  color: #ef4444;
}

.empty-state h2 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #111827;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 30px;
}

.btn-primary, .btn-retry {
  display: inline-block;
  padding: 12px 30px;
  background: #2563eb;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.2s;
  border: none;
  cursor: pointer;
}

.btn-primary:hover, .btn-retry:hover {
  background: #1d4ed8;
}

.error-state p {
  color: #ef4444;
  margin-bottom: 20px;
}
</style>