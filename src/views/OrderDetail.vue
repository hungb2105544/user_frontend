<template>
  <div class="order-detail-page">
    <div class="container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải chi tiết đơn hàng...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <h2>Không tìm thấy đơn hàng</h2>
        <p>{{ error }}</p>
        <RouterLink to="/orders" class="btn-primary">Quay lại danh sách</RouterLink>
      </div>

      <div v-else-if="order" class="order-detail-content">
        <div class="order-main-info">
          <div class="order-header">
            <h1>Chi tiết đơn hàng #{{ order.id }}</h1>
            <span :class="['status-badge', getStatusClass(order.status)]">
              {{ getStatusText(order.status) }}
            </span>
          </div>
          <p class="order-date">Ngày đặt: {{ formatDate(order.created_at) }}</p>

          <div class="details-grid">
            <!-- Shipping Info -->
            <div class="detail-card">
              <h3>Thông tin giao hàng</h3>
              <p><strong>Người nhận:</strong> {{ order.shipping_info.name }}</p>
              <p><strong>Số điện thoại:</strong> {{ order.shipping_info.phone }}</p>
              <p><strong>Địa chỉ:</strong> {{ order.shipping_info.address }}</p>
            </div>

            <!-- Payment Info -->
            <div class="detail-card">
              <h3>Thanh toán</h3>
              <p><strong>Phương thức:</strong> Thanh toán khi nhận hàng (COD)</p>
              <p><strong>Trạng thái:</strong> 
                <span v-if="order.status === 'delivered'">Đã thanh toán</span>
                <span v-else>Chưa thanh toán</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="order-items-card">
          <h3>Các sản phẩm</h3>
          <div class="order-items-list">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <img :src="item.product.image_urls[0]" :alt="item.product.name" class="item-image" />
              <div class="item-info">
                <p class="item-name">{{ item.product.name }}</p>
                <p class="item-variant" v-if="item.variant">
                  Màu: {{ item.variant.color }} | Size: {{ item.variant.size.size_name }}
                </p>
                <p class="item-quantity">Số lượng: {{ item.quantity }}</p>
              </div>
              <div class="item-price">
                <p>{{ formatPrice(item.unit_price * item.quantity) }}</p>
                <p class="unit-price">{{ formatPrice(item.unit_price) }} / sản phẩm</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="order-summary-card">
          <h3>Tổng cộng</h3>
          <div class="summary-row">
            <span>Tạm tính:</span>
            <span>{{ formatPrice(order.total_amount - order.shipping_fee) }}</span>
          </div>
          <div class="summary-row">
            <span>Phí vận chuyển:</span>
            <span>{{ formatPrice(order.shipping_fee) }}</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row total">
            <span>Thành tiền:</span>
            <span>{{ formatPrice(order.total_amount) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
// TODO: Create and use an order store
// import { useOrderStore } from '@/stores/order';

const route = useRoute();
const toast = useToast();
// const orderStore = useOrderStore();

const loading = ref(true);
const error = ref(null);
const order = ref(null);

const fetchOrderDetail = async () => {
  const orderId = route.params.id;
  loading.value = true;
  error.value = null;
  try {
    // Replace with: order.value = await orderStore.fetchOrderById(orderId);
    
    // Mock data for demonstration
    await new Promise(resolve => setTimeout(resolve, 1000));
    order.value = {
      id: orderId,
      created_at: new Date(),
      total_amount: 780000,
      status: 'processing',
      shipping_fee: 30000,
      shipping_info: {
        name: 'Nguyễn Văn A',
        phone: '0987654321',
        address: '123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh'
      },
      items: [
        {
          id: 1,
          quantity: 1,
          unit_price: 500000,
          product: { name: 'Áo Sơ Mi Dài Tay', image_urls: ['/placeholder-product.jpg'] },
          variant: { color: 'Trắng', size: { size_name: 'L' } }
        },
        {
          id: 2,
          quantity: 1,
          unit_price: 250000,
          product: { name: 'Quần Short Kaki', image_urls: ['/placeholder-product.jpg'] },
          variant: { color: 'Đen', size: { size_name: '32' } }
        }
      ]
    };

  } catch (err) {
    error.value = 'Không thể tải chi tiết đơn hàng. Vui lòng thử lại.';
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchOrderDetail();
});

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const getStatusText = (status) => ({
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
}[status] || 'Không xác định');

const getStatusClass = (status) => `status-${status}`;
</script>

<style scoped>
.order-detail-page {
  padding: 40px 0;
  background: #f9fafb;
}
.container {
  max-width: 900px;
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
.order-main-info, .order-items-card, .order-summary-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  margin-bottom: 20px;
}
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.order-header h1 {
  font-size: 28px;
}
.order-date {
  color: #6b7280;
  margin-bottom: 20px;
}
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.detail-card h3, .order-items-card h3, .order-summary-card h3 {
  font-size: 18px;
  margin-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 10px;
}
.detail-card p {
  margin-bottom: 8px;
  line-height: 1.6;
}
.order-item {
  display: flex;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #e5e7eb;
}
.order-item:last-child {
  border-bottom: none;
}
.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}
.item-info {
  flex: 1;
}
.item-name {
  font-weight: 600;
}
.item-variant, .item-quantity {
  font-size: 14px;
  color: #6b7280;
}
.item-price {
  text-align: right;
  font-weight: 600;
}
.unit-price {
  font-size: 12px;
  color: #6b7280;
  font-weight: 400;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}
.summary-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 10px 0 15px;
}
.summary-row.total {
  font-size: 20px;
  font-weight: 700;
}
.status-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}
.status-pending, .status-processing { background-color: #eff6ff; color: #2563eb; }
.status-shipped { background-color: #fef3c7; color: #d97706; }
.status-delivered { background-color: #dcfce7; color: #16a34a; }
.status-cancelled { background-color: #fee2e2; color: #ef4444; }

@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>