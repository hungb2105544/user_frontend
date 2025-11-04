<template>
  <div class="home">
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1>Chào mừng đến với {{ appName }}</h1>
          <p>Khám phá hàng ngàn sản phẩm chất lượng với giá tốt nhất</p>
          <RouterLink to="/products" class="btn-hero">
            Mua sắm ngay
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="featured-products">
      <div class="container">
        <h2 class="section-title">Sản phẩm nổi bật</h2>
        
        <div v-if="loading" class="loading">
          <p>Đang tải...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <p>Đã xảy ra lỗi khi tải sản phẩm.</p>
          <button @click="fetchData" class="btn-retry">Thử lại</button>
        </div>

        <div v-else class="product-grid">
          <ProductCard 
            v-for="product in featuredProducts" 
            :key="product.id" 
            :product="product"
          />
        </div>

        <div class="text-center" style="margin-top: 30px;">
          <RouterLink to="/products" class="btn-view-all">
            Xem tất cả sản phẩm
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">🚚</div>
            <h3>Giao hàng nhanh</h3>
            <p>Miễn phí vận chuyển cho đơn hàng từ 500k</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">💳</div>
            <h3>Thanh toán an toàn</h3>
            <p>Nhiều phương thức thanh toán tiện lợi</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🔄</div>
            <h3>Đổi trả dễ dàng</h3>
            <p>Đổi trả trong vòng 7 ngày</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🎁</div>
            <h3>Ưu đãi hấp dẫn</h3>
            <p>Nhiều chương trình khuyến mãi</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useProductStore } from '@/stores/product';
import ProductCard from '@/components/product/ProductCard.vue';

const appName = import.meta.env.VITE_APP_NAME;
const productStore = useProductStore();

const loading = ref(false);
const error = ref(null);

const featuredProducts = computed(() => {
  return productStore.products.slice(0, 8);
});

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    await productStore.fetchProducts();
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
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
}

.hero-content h1 {
  font-size: 48px;
  margin-bottom: 20px;
}

.hero-content p {
  font-size: 20px;
  margin-bottom: 30px;
  opacity: 0.9;
}

.btn-hero {
  display: inline-block;
  padding: 15px 40px;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 18px;
  transition: transform 0.2s;
}

.btn-hero:hover {
  transform: translateY(-2px);
}

.featured-products {
  padding: 60px 0;
}

.section-title {
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

.loading {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.error-state {
  text-align: center;
  padding: 40px;
  color: #ef4444;
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

.btn-view-all {
  display: inline-block;
  padding: 12px 30px;
  background: #2563eb;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-view-all:hover {
  background: #1d4ed8;
}

.features {
  padding: 60px 0;
  background: #f9fafb;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-item {
  text-align: center;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.feature-item h3 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #111827;
}

.feature-item p {
  color: #6b7280;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.text-center {
  text-align: center;
}
</style>