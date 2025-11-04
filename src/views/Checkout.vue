<template>
  <div class="checkout-page">
    <div class="container">
      <h1 class="page-title">Thanh toán</h1>

      <div v-if="cartStore.loading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải thông tin giỏ hàng...</p>
      </div>

      <div v-else-if="cartItems.length === 0" class="empty-cart">
        <h2>Giỏ hàng của bạn đang trống</h2>
        <p>Không có sản phẩm để thanh toán. Vui lòng thêm sản phẩm vào giỏ hàng trước.</p>
        <RouterLink to="/products" class="btn-primary">Tiếp tục mua sắm</RouterLink>
      </div>

      <form v-else @submit.prevent="placeOrder" class="checkout-content">
        <!-- Shipping Details -->
        <div class="shipping-details">
          <h2>Thông tin giao hàng</h2>
          <div class="form-group">
            <label for="name">Họ và tên</label>
            <input type="text" id="name" v-model="shippingInfo.name" required placeholder="Nguyễn Văn A" />
          </div>
          <div class="form-group">
            <label for="phone">Số điện thoại</label>
            <input type="tel" id="phone" v-model="shippingInfo.phone" required placeholder="09xxxxxxxx" />
          </div>
          <div class="form-group">
            <label for="address">Địa chỉ</label>
            <input type="text" id="address" v-model="shippingInfo.address" required placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" />
          </div>
          <div class="form-group">
            <label for="note">Ghi chú (tùy chọn)</label>
            <textarea id="note" v-model="shippingInfo.note" placeholder="Ví dụ: Giao hàng trong giờ hành chính"></textarea>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="order-summary">
          <h2>Đơn hàng của bạn</h2>
          <div class="summary-items">
            <div v-for="item in cartItems" :key="item.id" class="summary-item">
              <img :src="item.products?.image_urls?.[0]" :alt="item.products?.name" class="item-image" />
              <div class="item-details">
                <span class="item-name">{{ item.products?.name }}</span>
                <span class="item-quantity">x {{ item.quantity }}</span>
              </div>
              <span class="item-price">{{ formatPrice(item.unit_price * item.quantity) }}</span>
            </div>
          </div>

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

          <button type="submit" class="btn-place-order" :disabled="isPlacingOrder">
            {{ isPlacingOrder ? 'Đang xử lý...' : 'Đặt hàng' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const toast = useToast();

const isPlacingOrder = ref(false);
const shippingInfo = ref({
  name: authStore.user?.name || '',
  phone: authStore.user?.phone || '',
  address: authStore.user?.address || '',
  note: '',
});

const cartItems = computed(() => cartStore.cartItems);
const cartTotal = computed(() => cartStore.cartTotal);

const shippingFee = computed(() => {
  return cartTotal.value >= 500000 ? 0 : 30000;
});

const placeOrder = async () => {
  isPlacingOrder.value = true;
  try {
    // TODO: Create an orderStore and call an action to place the order
    // const order = await orderStore.createOrder({
    //   shipping_info: shippingInfo.value,
    //   items: cartItems.value,
    //   total: cartTotal.value + shippingFee.value,
    // });

    // For demonstration, we'll just simulate a success
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('Đặt hàng thành công!');
    await cartStore.fetchCart(); // Refresh cart (should be empty now)
    
    // TODO: Redirect to the order detail page
    // router.push({ name: 'order-detail', params: { id: order.id } });
    router.push('/orders');

  } catch (error) {
    toast.error('Đặt hàng thất bại. Vui lòng thử lại.');
    console.error('Failed to place order:', error);
  } finally {
    isPlacingOrder.value = false;
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price || 0);
};

onMounted(() => {
  if (cartStore.cartItems.length === 0) {
    cartStore.fetchCart();
  }
});
</script>

<style scoped>
.checkout-page {
  padding: 40px 0;
  background: #f9fafb;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
.page-title {
  font-size: 32px;
  margin-bottom: 30px;
}
.loading, .empty-cart {
  text-align: center;
  padding: 60px 20px;
}
.checkout-content {
  display: grid;
  grid-template-columns: 1fr 450px;
  gap: 30px;
}
.shipping-details {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.shipping-details h2 {
  font-size: 22px;
  margin-bottom: 25px;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}
.form-group input, .form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
}
.form-group textarea {
  min-height: 100px;
  resize: vertical;
}
.order-summary {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  position: sticky;
  top: 90px;
}
.order-summary h2 {
  font-size: 22px;
  margin-bottom: 20px;
}
.summary-items {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding-right: 10px;
}
.summary-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}
.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}
.item-details {
  flex: 1;
}
.item-name {
  display: block;
  font-weight: 500;
}
.item-quantity {
  color: #6b7280;
  font-size: 14px;
}
.item-price {
  font-weight: 600;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}
.summary-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 15px 0;
}
.summary-row.total {
  font-size: 20px;
  font-weight: 700;
}
.btn-place-order {
  width: 100%;
  padding: 15px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.2s;
}
.btn-place-order:hover:not(:disabled) {
  background: #1d4ed8;
}
.btn-place-order:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }
  .order-summary {
    position: static;
  }
}
</style>