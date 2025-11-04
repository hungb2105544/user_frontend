<template>
  <div class="product-detail-page">
    <div class="container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải chi tiết sản phẩm...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <h2>Không tìm thấy sản phẩm</h2>
        <p>{{ error }}</p>
        <RouterLink to="/products" class="btn-primary">Quay lại danh sách</RouterLink>
      </div>

      <div v-else-if="product" class="product-content">
        <!-- Product Images -->
        <div class="product-gallery">
          <div class="main-image">
            <img :src="activeImage" :alt="product.name" />
          </div>
          <div class="thumbnail-images">
            <img
              v-for="(image, index) in product.image_urls"
              :key="index"
              :src="image"
              :alt="`${product.name} thumbnail ${index + 1}`"
              :class="{ active: image === activeImage }"
              @click="activeImage = image"
            />
          </div>
        </div>

        <!-- Product Info -->
        <div class="product-info">
          <h1 class="product-name">{{ product.name }}</h1>
          <p class="product-price">{{ formatPrice(selectedVariant ? selectedVariant.price: product.price) }}</p>

          <!-- Variants Selection -->
          <div class="variants">
            <!-- Color Variant -->
            <div class="variant-group" v-if="colors.length > 0">
              <label>Màu sắc:</label>
              <div class="variant-options">
                <button
                  v-for="color in colors"
                  :key="color"
                  class="variant-btn color-btn"
                  :class="{ active: selectedColor === color }"
                  :style="{ backgroundColor: color }"
                  @click="selectColor(color)"
                  :title="color"
                ></button>
              </div>
            </div>

            <!-- Size Variant -->
            <div class="variant-group" v-if="sizes.length > 0">
              <label>Kích thước:</label>
              <div class="variant-options">
                <button
                  v-for="size in sizes"
                  :key="size.size_id"
                  class="variant-btn size-btn"
                  :class="{ active: selectedSizeId === size.size_id }"
                  @click="selectSize(size.size_id)"
                >
                  {{ size.size_name }}
                </button>
              </div>
            </div>
          </div>

          <!-- Quantity and Add to Cart -->
          <div class="actions">
            <div class="quantity-selector">
              <button @click="quantity > 1 && quantity--">-</button>
              <span>{{ quantity }}</span>
              <button @click="quantity++">+</button>
            </div>
            <button 
              class="btn-add-to-cart" 
              @click="handleAddToCart"
              :disabled="!canAddToCart || addingToCart"
            >
              <span v-if="addingToCart">Đang thêm...</span>
              <span v-else>Thêm vào giỏ hàng</span>
            </button>
          </div>
          <p v-if="!canAddToCart && product.variants.length > 0" class="variant-error">
            Vui lòng chọn đầy đủ màu sắc và kích thước.
          </p>

          <!-- Product Description -->
          <div class="product-description">
            <h3>Mô tả sản phẩm</h3>
            <p>{{ product.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useProductStore } from '@/stores/product';
import { useCartStore } from '@/stores/cart';
import { useToast } from 'vue-toastification';

const route = useRoute();
const productStore = useProductStore();
const cartStore = useCartStore();
const toast = useToast();

const loading = ref(true);
const error = ref(null);
const product = ref(null);
const activeImage = ref('');

const selectedColor = ref(null);
const selectedSizeId = ref(null);
const quantity = ref(1);
const addingToCart = ref(false);

const productId = route.params.id;

onMounted(async () => {
  try {
    product.value = await productStore.fetchProductById(productId);
    if (product.value.image_urls && product.value.image_urls.length > 0) {
      activeImage.value = product.value.image_urls[0];
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Không thể tải thông tin sản phẩm.';
  } finally {
    loading.value = false;
  }
});

// --- Computed properties for variants ---
const colors = computed(() => {
  if (!product.value?.variants) return [];
  const colorSet = new Set(product.value.variants.map(v => v.color));
  return Array.from(colorSet);
});

const sizes = computed(() => {
  if (!product.value?.variants || !selectedColor.value) return [];
  return product.value.variants
    .filter(v => v.color === selectedColor.value)
    .map(v => ({ size_id: v.size_id, size_name: v.size.size_name }));
});

const selectedVariant = computed(() => {
  if (!product.value?.variants || !selectedColor.value || !selectedSizeId.value) {
    return null;
  }
  return product.value.variants.find(
    v => v.color === selectedColor.value && v.size_id === selectedSizeId.value
  );
});

const canAddToCart = computed(() => {
  if (!product.value) return false;
  // If no variants, can always add
  if (product.value.variants.length === 0) return true;
  // If has variants, must select one
  return !!selectedVariant.value;
});

// --- Watchers to reset selections ---
watch(selectedColor, () => {
  selectedSizeId.value = null; // Reset size when color changes
});

// --- Methods ---
const selectColor = (color) => {
  selectedColor.value = color;
};

const selectSize = (sizeId) => {
  selectedSizeId.value = sizeId;
};

const handleAddToCart = async () => {
  if (!canAddToCart.value) return;
  addingToCart.value = true;
  try {
    await cartStore.addToCart({
      product_id: product.value.id,
      variant_id: selectedVariant.value?.id, // Can be null if no variants
      quantity: quantity.value,
    });
    toast.success('Đã thêm sản phẩm vào giỏ hàng!');
  } catch (err) {
    toast.error(err.response?.data?.error || 'Thêm vào giỏ hàng thất bại.');
  } finally {
    addingToCart.value = false;
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price || 0);
};
</script>

<style scoped>
.product-detail-page {
  padding: 40px 0;
  background: #f9fafb;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
.loading-state, .error-state {
  text-align: center;
  padding: 80px 20px;
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
.product-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}
.product-gallery .main-image {
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
}
.product-gallery .main-image img {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}
.thumbnail-images {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}
.thumbnail-images img {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}
.thumbnail-images img.active {
  border-color: #2563eb;
}
.product-name {
  font-size: 32px;
  margin-bottom: 15px;
}
.product-price {
  font-size: 28px;
  font-weight: 700;
  color: #ef4444;
  margin-bottom: 25px;
}
.variant-group {
  margin-bottom: 20px;
}
.variant-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
}
.variant-options {
  display: flex;
  gap: 10px;
}
.variant-btn {
  border: 1px solid #d1d5db;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}
.variant-btn.active {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}
.color-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}
.size-btn {
  padding: 8px 16px;
  border-radius: 8px;
}
.actions {
  display: flex;
  gap: 20px;
  margin-top: 30px;
  align-items: center;
}
.quantity-selector {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}
.quantity-selector button {
  width: 44px;
  height: 44px;
  border: none;
  background: none;
  font-size: 20px;
  cursor: pointer;
}
.quantity-selector span {
  padding: 0 10px;
  font-weight: 600;
  font-size: 18px;
  min-width: 40px;
  text-align: center;
}
.btn-add-to-cart {
  flex: 1;
  padding: 14px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-add-to-cart:hover:not(:disabled) {
  background: #1d4ed8;
}
.btn-add-to-cart:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.variant-error {
  color: #ef4444;
  margin-top: 10px;
}
.product-description {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}
.product-description h3 {
  margin-bottom: 10px;
}
.product-description p {
  color: #374151;
  line-height: 1.7;
}

@media (max-width: 768px) {
  .product-content {
    grid-template-columns: 1fr;
    padding: 20px;
  }
}
</style>