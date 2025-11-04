<template>
  <div class="voucher-page">
    <div class="container">
      <h1 class="page-title">Voucher của tôi</h1>

      <div class="voucher-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'available' }"
          @click="activeTab = 'available'"
        >
          Có thể sử dụng ({{ availableVouchers.length }})
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'used' }"
          @click="activeTab = 'used'"
        >
          Đã sử dụng ({{ usedVouchers.length }})
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'expired' }"
          @click="activeTab = 'expired'"
        >
          Hết hạn ({{ expiredVouchers.length }})
        </button>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải voucher...</p>
      </div>

      <div v-else-if="currentVouchers.length === 0" class="empty-state">
        <div class="empty-icon">🎫</div>
        <h2>Không có voucher</h2>
        <p v-if="activeTab === 'available'">
          Bạn chưa có voucher nào có thể sử dụng
        </p>
        <p v-else-if="activeTab === 'used'">
          Bạn chưa sử dụng voucher nào
        </p>
        <p v-else>
          Bạn không có voucher nào hết hạn
        </p>
        <RouterLink to="/products" class="btn-primary">
          Tiếp tục mua sắm
        </RouterLink>
      </div>

      <div v-else class="voucher-list">
        <div 
          v-for="userVoucher in currentVouchers" 
          :key="userVoucher.id"
          class="voucher-card"
          :class="{ 
            used: userVoucher.is_used, 
            expired: isExpired(userVoucher.vouchers) 
          }"
        >
          <div class="voucher-left">
            <div class="voucher-icon">
              <span v-if="userVoucher.vouchers.type === 'percentage'">%</span>
              <span v-else-if="userVoucher.vouchers.type === 'fixed_amount'">₫</span>
              <span v-else>🚚</span>
            </div>
            <div class="voucher-value">
              <span v-if="userVoucher.vouchers.type === 'percentage'">
                {{ userVoucher.vouchers.value }}%
              </span>
              <span v-else-if="userVoucher.vouchers.type === 'fixed_amount'">
                {{ formatPrice(userVoucher.vouchers.value) }}
              </span>
              <span v-else>
                FREE SHIP
              </span>
            </div>
          </div>

          <div class="voucher-content">
            <div class="voucher-header">
              <h3 class="voucher-name">{{ userVoucher.vouchers.name }}</h3>
              <span class="voucher-code">{{ userVoucher.vouchers.code }}</span>
            </div>

            <p class="voucher-description">
              {{ userVoucher.vouchers.description }}
            </p>

            <div class="voucher-details">
              <div class="detail-item" v-if="userVoucher.vouchers.min_order_value">
                <span class="label">Đơn tối thiểu:</span>
                <span class="value">{{ formatPrice(userVoucher.vouchers.min_order_value) }}</span>
              </div>
              <div class="detail-item" v-if="userVoucher.vouchers.max_discount_amount">
                <span class="label">Giảm tối đa:</span>
                <span class="value">{{ formatPrice(userVoucher.vouchers.max_discount_amount) }}</span>
              </div>
            </div>

            <div class="voucher-footer">
              <div class="voucher-date">
                <span class="date-label">HSD:</span>
                <span class="date-value">{{ formatDate(userVoucher.vouchers.valid_to) }}</span>
              </div>

              <button 
                v-if="activeTab === 'available'"
                class="btn-use"
                @click="handleUseVoucher(userVoucher.vouchers.code)"
              >
                Sử dụng ngay
              </button>

              <span v-else-if="activeTab === 'used'" class="status-badge used">
                Đã sử dụng
              </span>

              <span v-else class="status-badge expired">
                Hết hạn
              </span>
            </div>
          </div>

          <div class="voucher-pattern">
            <div class="circle circle-top"></div>
            <div class="circle circle-bottom"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal nhập mã voucher -->
    <div v-if="showVoucherModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeModal">✕</button>
        
        <h2>Nhập mã voucher</h2>
        <p class="modal-subtitle">Nhập mã voucher để nhận ưu đãi</p>

        <form @submit.prevent="handleAddVoucher">
          <div class="form-group">
            <input
              v-model="voucherCode"
              type="text"
              placeholder="Nhập mã voucher"
              class="voucher-input"
              :disabled="addingVoucher"
            />
          </div>

          <button 
            type="submit" 
            class="btn-submit"
            :disabled="addingVoucher || !voucherCode.trim()"
          >
            {{ addingVoucher ? 'Đang xử lý...' : 'Áp dụng' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useToast } from 'vue-toastification';

const router = useRouter();
const userStore = useUserStore();
const toast = useToast();

const activeTab = ref('available');
const loading = ref(false);
const showVoucherModal = ref(false);
const voucherCode = ref('');
const addingVoucher = ref(false);

const availableVouchers = computed(() => {
  return userStore.vouchers.filter(v => 
    !v.is_used && !isExpired(v.vouchers)
  );
});

const usedVouchers = computed(() => {
  return userStore.vouchers.filter(v => v.is_used);
});

const expiredVouchers = computed(() => {
  return userStore.vouchers.filter(v => 
    !v.is_used && isExpired(v.vouchers)
  );
});

const currentVouchers = computed(() => {
  switch (activeTab.value) {
    case 'available':
      return availableVouchers.value;
    case 'used':
      return usedVouchers.value;
    case 'expired':
      return expiredVouchers.value;
    default:
      return [];
  }
});

const isExpired = (voucher) => {
  if (!voucher || !voucher.valid_to) return false;
  return new Date(voucher.valid_to) < new Date();
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price || 0);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const handleUseVoucher = (code) => {
  // Copy mã voucher
  navigator.clipboard.writeText(code).then(() => {
    toast.success('Đã copy mã voucher! Áp dụng khi thanh toán.');
    router.push('/cart');
  }).catch(() => {
    toast.info(`Mã voucher: ${code}`);
    router.push('/cart');
  });
};

const closeModal = () => {
  showVoucherModal.value = false;
  voucherCode.value = '';
};

const handleAddVoucher = async () => {
  if (!voucherCode.value.trim()) return;

  addingVoucher.value = true;
  try {
    await userStore.addUserVoucher(voucherCode.value.trim());
    toast.success('Đã thêm voucher thành công!');
    await userStore.fetchVouchers();
    closeModal();
  } catch (error) {
    toast.error(error.response?.data?.error || 'Không thể thêm voucher');
  } finally {
    addingVoucher.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    await userStore.fetchVouchers();
  } catch (error) {
    toast.error('Không thể tải danh sách voucher');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.voucher-page {
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
  margin-bottom: 30px;
  color: #111827;
}

.voucher-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #e5e7eb;
}

.tab-btn {
  padding: 12px 24px;
  background: none;
  border: none;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.tab-btn:hover {
  color: #2563eb;
}

.tab-btn.active {
  color: #2563eb;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #2563eb;
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
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

.btn-primary {
  display: inline-block;
  padding: 12px 30px;
  background: #2563eb;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.voucher-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 20px;
}

.voucher-card {
  display: flex;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
}

.voucher-card:not(.used):not(.expired):hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.voucher-card.used {
  opacity: 0.6;
}

.voucher-card.expired {
  opacity: 0.5;
  filter: grayscale(0.5);
}

.voucher-left {
  width: 140px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: white;
  position: relative;
}

.voucher-icon {
  font-size: 32px;
  margin-bottom: 10px;
  font-weight: bold;
}

.voucher-value {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
}

.voucher-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.voucher-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: 10px;
}

.voucher-name {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.voucher-code {
  padding: 4px 12px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.voucher-description {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 15px;
  line-height: 1.6;
}

.voucher-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  gap: 5px;
  font-size: 14px;
}

.detail-item .label {
  color: #6b7280;
}

.detail-item .value {
  color: #111827;
  font-weight: 600;
}

.voucher-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid #e5e7eb;
}

.voucher-date {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.date-label {
  color: #6b7280;
}

.date-value {
  color: #ef4444;
  font-weight: 600;
}

.btn-use {
  padding: 8px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-use:hover {
  background: #1d4ed8;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
}

.status-badge.used {
  background: #f3f4f6;
  color: #6b7280;
}

.status-badge.expired {
  background: #fee2e2;
  color: #ef4444;
}

.voucher-pattern {
  position: absolute;
  left: 140px;
  top: 0;
  bottom: 0;
  width: 20px;
}

.circle {
  position: absolute;
  width: 20px;
  height: 20px;
  background: #f9fafb;
  border-radius: 50%;
  left: -10px;
}

.circle-top {
  top: -10px;
}

.circle-bottom {
  bottom: -10px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  transition: background 0.2s;
}

.modal-close:hover {
  background: #e5e7eb;
}

.modal-content h2 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #111827;
}

.modal-subtitle {
  color: #6b7280;
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.voucher-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  text-transform: uppercase;
}

.voucher-input:focus {
  outline: none;
  border-color: #2563eb;
}

.btn-submit {
  width: 100%;
  padding: 12px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .voucher-list {
    grid-template-columns: 1fr;
  }

  .voucher-card {
    flex-direction: column;
  }

  .voucher-left {
    width: 100%;
    padding: 15px;
  }

  .voucher-pattern {
    display: none;
  }
}
</style>