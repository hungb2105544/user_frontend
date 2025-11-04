<template>
  <div class="cart-page">
    <div class="container">
      <h1 class="page-title">Giỏ hàng của bạn</h1>

      <div v-if="loading" class="loading">
        <p>Đang tải...</p>
      </div>

      <div v-else-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h2>Giỏ hàng trống</h2>
        <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
        <RouterLink to="/products" class="btn-primary">
          Tiếp tục mua sắm
        </RouterLink>
      </div>

      <div v-else class="cart-content">
        <div class="cart-items">
          <div 
            v-for="item in cartItems" 
            :key="item.id" 
            class="cart-item"
            :class="{ 'updating': updatingItemId === item.id }"
          >
            <img 
              :src="item.products?.image_urls?.[0] || '/placeholder-product.jpg'" 
              :alt="item.products?.name"
              class="item-image"
            />
            
            <div class="item-info">
              <h3>{{ item.products?.name }}</h3>
              <p class="item-variant" v-if="item.product_variants">
                Màu: {{ item.product_variants.color }} | 
                Size: {{ item.product_variants.size?.size_name }}
              </p>
              <p class="item-price">{{ formatPrice(item.unit_price) }}</p>
            </div>

            <div class="item-quantity">
              <button 
                @click="updateQuantity(item, item.quantity - 1)"
                :disabled="item.quantity <= 1 || updatingItemId === item.id"
              >
                -
              </button>
              <span>{{ item.quantity }}</span>
              <button @click="updateQuantity(item, item.quantity + 1)" :disabled="updatingItemId === item.id">
                +
              </button>
            </div>

            <div class="item-total">
              {{ formatPrice(item.unit_price * item.quantity) }}
            </div>

            <button 
              class="btn-remove" 
              @click="removeItem(item.id)"
              :disabled="updatingItemId === item.id"
              title="Xóa"
            >
              <span v-if="updatingItemId !== item.id">✕</span>
              <div v-else class="spinner"></div>
            </button>
          </div>
        </div>

        <div class="cart-summary">
          <h2>Tóm tắt đơn hàng</h2>
          
          <div class="summary-row">
            <span>Tạm tính:</span>
            <span>{{ formatPrice(cartTotal) }}</span>
          </div>

          <div class="summary-row">
            <span>Phí vận chuyển:</span>
            <span>{{ formatPrice(shippingFee) }}</span>
          </div>

          <div class="summary-divider"></div>

          <div class="summary-row total">
            <span>Tổng cộng:</span>
            <span>{{ formatPrice(cartTotal + shippingFee) }}</span>
          </div>

          <RouterLink to="/checkout" class="btn-checkout">
            Tiến hành thanh toán
          </RouterLink>

          <RouterLink to="/products" class="btn-continue">
            Tiếp tục mua sắm
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useToast } from 'vue-toastification';
import { useCartStore } from '@/stores/cart';

const cartStore = useCartStore();
const toast = useToast();

const loading = computed(() => cartStore.loading);
const cartItems = computed(() => cartStore.cartItems);
const cartTotal = computed(() => cartStore.cartTotal);

const updatingItemId = ref(null);

const shippingFee = computed(() => {
  return cartTotal.value >= 500000 ? 0 : 30000;
});

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price || 0);
};

const updateQuantity = async (item, newQuantity) => {
  if (newQuantity < 1 || updatingItemId.value) return;
  updatingItemId.value = item.id;
  try {
    await cartStore.updateCartItem(item.id, newQuantity);
    toast.success('Cập nhật giỏ hàng thành công!');
  } catch (error) {
    console.error('Failed to update cart item:', error);
    toast.error('Không thể cập nhật số lượng. Vui lòng thử lại.');
  } finally {
    updatingItemId.value = null;
  }
};

const removeItem = async (itemId) => {
  if (updatingItemId.value) return;
  if (confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
    updatingItemId.value = itemId;
    try {
      await cartStore.removeFromCart(itemId);
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng.');
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      toast.error('Không thể xóa sản phẩm. Vui lòng thử lại.');
    } finally {
      updatingItemId.value = null;
    }
  }
};

onMounted(() => {
  cartStore.fetchCart();
});
</script>

<style scoped>
.cart-page {
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
  margin-bottom: 30px;
  color: #111827;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.empty-cart {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-cart h2 {
  font-size: 28px;
  margin-bottom: 15px;
  color: #111827;
}

.empty-cart p {
  color: #6b7280;
  margin-bottom: 30px;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 30px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: opacity 0.3s ease;
}

.cart-item.updating {
  opacity: 0.6;
  pointer-events: none;
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.item-info {
  flex: 1;
}

.item-info h3 {
  font-size: 18px;
  margin-bottom: 8px;
  color: #111827;
}

.item-variant {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.item-price {
  font-size: 16px;
  font-weight: 600;
  color: #ef4444;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 15px;
}

.item-quantity button {
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
}

.item-quantity button:hover:not(:disabled) {
  background: #f3f4f6;
}

.item-quantity button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.item-quantity span {
  font-weight: 600;
  min-width: 30px;
  text-align: center;
}

.item-total {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  min-width: 120px;
  text-align: right;
}

.btn-remove {
  width: 32px;
  height: 32px;
  border: none;
  background: #fee2e2;
  color: #ef4444;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove:hover {
  background: #fecaca;
}

.btn-remove:disabled {
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.cart-summary {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  height: fit-content;
  position: sticky;
  top: 90px;
}

.cart-summary h2 {
  font-size: 20px;
  margin-bottom: 20px;
  color: #111827;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  color: #374151;
}

.summary-row.total {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.summary-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 20px 0;
}

.btn-checkout, .btn-primary {
  display: block;
  width: 100%;
  padding: 14px;
  background: #2563eb;
  color: white;
  text-align: center;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 12px;
  transition: background 0.2s;
}

.btn-checkout:hover, .btn-primary:hover {
  background: #1d4ed8;
}

.btn-continue {
  display: block;
  width: 100%;
  padding: 14px;
  background: transparent;
  color: #2563eb;
  text-align: center;
  text-decoration: none;
  border: 1px solid #2563eb;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-continue:hover {
  background: #eff6ff;
}

@media (max-width: 1024px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
  
  .cart-summary {
    position: static;
  }
}

@media (max-width: 640px) {
  .cart-item {
    flex-wrap: wrap;
  }
  
  .item-image {
    width: 80px;
    height: 80px;
  }
  
  .item-quantity, .item-total {
    width: 100%;
    justify-content: center;
  }
}
</style>