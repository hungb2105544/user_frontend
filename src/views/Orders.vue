<template>
  <div class="orders-page">
    <div class="container">
      <h1 class="page-title">Đơn hàng của tôi</h1>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải lịch sử đơn hàng...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <h2>Đã xảy ra lỗi</h2>
        <p>{{ error }}</p>
        <button @click="fetchOrders" class="btn-retry">Thử lại</button>
      </div>

      <div v-else-if="orders.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <h2>Chưa có đơn hàng nào</h2>
        <p>Bạn chưa thực hiện đơn hàng nào. Hãy bắt đầu mua sắm ngay!</p>
        <RouterLink to="/products" class="btn-primary">Bắt đầu mua sắm</RouterLink>
      </div>

      <div v-else class="order-list">
        <RouterLink 
          v-for="order in orders" 
          :key="order.id" 
          :to="`/orders/${order.id}`"
          class="order-card"
        >
          <div class="order-header">
            <span class="order-id">Mã đơn hàng: #{{ order.id }}</span>
            <span :class="['status-badge', getStatusClass(order.status)]">
              {{ getStatusText(order.status) }}
            </span>
          </div>
          <div class="order-body">
            <div class="order-info">
              <p><strong>Ngày đặt:</strong> {{ formatDate(order.created_at) }}</p>
              <p><strong>Tổng tiền:</strong> {{ formatPrice(order.total_amount) }}</p>
            </div>
            <div class="order-action">
              <span>Xem chi tiết &rarr;</span>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'vue-toastification';
// TODO: Create an order store to manage orders
// import { useOrderStore } from '@/stores/order';

const toast = useToast();
// const orderStore = useOrderStore();

const loading = ref(true);
const error = ref(null);

// This is mock data. Replace with `orderStore.orders`
const orders = ref([]); 

// const orders = computed(() => orderStore.orders);

const fetchOrders = async () => {
  loading.value = true;
  error.value = null;
  try {
    // await orderStore.fetchOrders();
    
    // Mock data for demonstration
    await new Promise(resolve => setTimeout(resolve, 1000));
    orders.value = [
      { id: '1001', created_at: new Date(), total_amount: 750000, status: 'processing' },
      { id: '1002', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), total_amount: 320000, status: 'delivered' },
      { id: '1003', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), total_amount: 1250000, status: 'cancelled' },
    ];

  } catch (err) {
    error.value = 'Không thể tải lịch sử đơn hàng. Vui lòng thử lại.';
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchOrders();
});

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
};

const formatDate = (dateString) => {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('vi-VN', options);
};

const getStatusText = (status) => {
  const statusMap = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipped: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  };
  return statusMap[status] || 'Không xác định';
};

const getStatusClass = (status) => {
  return `status-${status}`;
};
</script>

<style scoped>
.orders-page {
  padding: 40px 0;
  min-height: calc(100vh - 200px);
  background: #f9fafb;
}
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}
.page-title {
  font-size: 32px;
  margin-bottom: 30px;
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
}
.order-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.order-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
}
.order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e5e7eb;
}
.order-id {
  font-weight: 600;
  color: #374151;
}
.status-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}
.status-pending, .status-processing {
  background-color: #eff6ff;
  color: #2563eb;
}
.status-shipped {
  background-color: #fef3c7;
  color: #d97706;
}
.status-delivered {
  background-color: #dcfce7;
  color: #16a34a;
}
.status-cancelled {
  background-color: #fee2e2;
  color: #ef4444;
}
.order-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}
.order-info p {
  margin: 0 0 8px;
  color: #6b7280;
}
.order-info p:last-child {
  margin-bottom: 0;
}
.order-info strong {
  color: #374151;
}
.order-action {
  color: #2563eb;
  font-weight: 500;
}
</style>