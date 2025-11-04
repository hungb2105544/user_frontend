<template>
  <div class="product-card">
    <RouterLink :to="`/products/${product.id}`" class="product-image">
      <img 
        :src="productImage" 
        :alt="product.name"
        @error="handleImageError"
      />
    </RouterLink>

    <div class="product-info">
      <RouterLink :to="`/products/${product.id}`" class="product-name">
        {{ product.name }}
      </RouterLink>

      <p class="product-brand" v-if="product.brands">
        {{ product.brands.brand_name }}
      </p>

      <div class="product-rating" v-if="product.average_rating">
        <span class="stars">⭐ {{ product.average_rating.toFixed(1) }}</span>
        <span class="reviews">({{ product.total_ratings }})</span>
      </div>

      <div class="product-footer">
        <p class="product-price">{{ formatPrice(product.price[0].price) }}</p>
        
        <div class="product-actions">
          <button 
            class="btn-icon" 
            @click="handleAddToCart"
            :disabled="loading"
            title="Thêm vào giỏ hàng"
          >
            🛒
          </button>
          <button 
            class="btn-icon" 
            @click="handleToggleWishlist"
            :class="{ active: isInWishlist }"
            title="Yêu thích"
          >
            ❤️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import wishlistService from '@/services/wishlist.service';
import { useToast } from 'vue-toastification';

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const loading = ref(false);
const isInWishlist = ref(false);

const productImage = computed(() => {
  if (props.product.image_urls && props.product.image_urls.length > 0) {
    return props.product.image_urls[0];
  }
  return '/placeholder-product.jpg';
});

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price || 0);
};

const handleImageError = (e) => {
  e.target.src = '/placeholder-product.jpg';
};

const handleAddToCart = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  loading.value = true;
  try {
    const variant = props.product.product_variants?.[0];
    await cartStore.addToCart({
      product_id: props.product.id,
      variant_id: variant?.id,
      quantity: 1,
    });
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleToggleWishlist = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  try {
    if (isInWishlist.value) {
      // Remove from wishlist
      await wishlistService.removeFromWishlist(props.product.wishlist_id);
      isInWishlist.value = false;
      toast.success('Đã xóa khỏi yêu thích');
    } else {
      // Add to wishlist
      await wishlistService.addToWishlist({ product_id: props.product.id });
      isInWishlist.value = true;
      toast.success('Đã thêm vào yêu thích');
    }
  } catch (error) {
    console.error(error);
  }
};
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.product-image {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: 15px;
}

.product-name {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  text-decoration: none;
  margin-bottom: 5px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-name:hover {
  color: #2563eb;
}

.product-brand {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 12px;
  font-size: 14px;
}

.stars {
  color: #f59e0b;
}

.reviews {
  color: #6b7280;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.product-price {
  font-size: 18px;
  font-weight: 700;
  color: #ef4444;
}

.product-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f3f4f6;
  transform: scale(1.1);
}

.btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon.active {
  color: #ef4444;
  border-color: #ef4444;
}
</style>