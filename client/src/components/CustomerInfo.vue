<template>
  <section class="customer-section info-card">
    <div class="card-header">
      <span class="card-icon">👤</span>
      <h2 class="card-title">客户信息</h2>
    </div>
    <div class="card-body">
      <div class="customer-header" v-if="showAvatar">
        <div class="customer-avatar">
          {{ customer?.customerName?.charAt?.(0) || '客' }}
        </div>
        <div class="customer-main">
          <div class="customer-name">{{ customer?.customerName }}</div>
          <div class="customer-contact">
            <span class="contact-label">联系人：</span>
            <span class="contact-value">{{ customer?.customerContact }}</span>
          </div>
        </div>
      </div>

      <div class="customer-info-grid" :class="{ 'three-col': showAddress }">
        <div class="info-item">
          <div class="info-icon-wrapper">
            <span class="info-icon">🏢</span>
          </div>
          <div class="info-content">
            <div class="info-label">客户名称</div>
            <div class="info-value">{{ customer?.customerName }}</div>
          </div>
        </div>
        <div class="info-item">
          <div class="info-icon-wrapper">
            <span class="info-icon">👤</span>
          </div>
          <div class="info-content">
            <div class="info-label">联系人</div>
            <div class="info-value">{{ customer?.customerContact }}</div>
          </div>
        </div>
        <div class="info-item contact-item">
          <div class="info-icon-wrapper phone-icon">
            <span class="info-icon">📞</span>
          </div>
          <div class="info-content">
            <div class="info-label">联系电话</div>
            <div class="info-value phone-number">{{ customer?.customerPhone }}</div>
          </div>
          <div v-if="showActions" class="contact-actions">
            <a :href="'tel:' + customer?.customerPhone" class="contact-btn call-btn">
              <span class="btn-icon">📱</span>
              <span>拨打电话</span>
            </a>
            <button class="contact-btn sms-btn" @click="handleCopyPhone">
              <span class="btn-icon">📋</span>
              <span>复制号码</span>
            </button>
          </div>
        </div>
        <div v-if="showAddress && customerAddress" class="info-item address-item">
          <div class="info-icon-wrapper address-icon">
            <span class="info-icon">📍</span>
          </div>
          <div class="info-content">
            <div class="info-label">{{ addressLabel }}</div>
            <div class="info-value address-text">{{ customerAddress }}</div>
          </div>
          <button v-if="showMapButton" class="contact-btn map-btn" @click="handleOpenMap">
            <span class="btn-icon">🗺️</span>
            <span>查看地图</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useCopyPhone } from '../composables/useCopyPhone'

const props = defineProps({
  customer: {
    type: Object,
    default: () => ({})
  },
  showAvatar: {
    type: Boolean,
    default: false
  },
  showActions: {
    type: Boolean,
    default: true
  },
  showAddress: {
    type: Boolean,
    default: false
  },
  customerAddress: {
    type: String,
    default: ''
  },
  addressLabel: {
    type: String,
    default: '联系地址'
  },
  showMapButton: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['copyPhone', 'openMap'])

const { showCopyTip, copyPhone } = useCopyPhone()

const handleCopyPhone = () => {
  if (props.customer?.customerPhone) {
    copyPhone(props.customer.customerPhone)
    emit('copyPhone', props.customer.customerPhone)
  }
}

const handleOpenMap = () => {
  if (props.customerAddress) {
    window.open(`https://map.baidu.com/search/${encodeURIComponent(props.customerAddress)}`, '_blank')
    emit('openMap', props.customerAddress)
  }
}
</script>

<style scoped>
.info-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9fb 0%, #fafbfc 100%);
  border-bottom: 1px solid #f0f2f5;
}

.card-icon {
  font-size: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.card-body {
  padding: 20px;
}

.customer-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.customer-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  flex-shrink: 0;
}

.customer-main {
  flex: 1;
}

.customer-name {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.customer-contact {
  font-size: 13px;
  color: #6b7280;
}

.contact-label {
  color: #9ca3af;
}

.contact-value {
  font-weight: 500;
  color: #4b5563;
}

.customer-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.customer-info-grid.three-col {
  grid-template-columns: 1fr 1fr;
}

.info-item {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #f0f1f3;
}

.contact-item,
.address-item {
  grid-column: span 1;
  align-items: center;
}

.info-icon-wrapper {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
}

.info-icon-wrapper.phone-icon {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
}

.info-icon-wrapper.address-icon {
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
}

.info-icon {
  font-size: 20px;
}

.info-content {
  flex: 1;
  min-width: 0;
}

.info-label {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #111827;
  font-weight: 600;
}

.phone-number {
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
}

.address-text {
  font-size: 13px;
  line-height: 1.5;
  font-weight: 500;
}

.contact-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.contact-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.call-btn {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #ffffff;
  border-color: #16a34a;
}

.call-btn:hover {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
}

.sms-btn {
  background: #ffffff;
  color: #4b5563;
  border-color: #d1d5db;
}

.sms-btn:hover {
  color: #3b82f6;
  border-color: #93c5fd;
  background: #eff6ff;
}

.map-btn {
  background: #ffffff;
  color: #4b5563;
  border-color: #d1d5db;
}

.map-btn:hover {
  color: #f59e0b;
  border-color: #fcd34d;
  background: #fffbeb;
}

.btn-icon {
  font-size: 14px;
}

@media (max-width: 768px) {
  .customer-info-grid {
    grid-template-columns: 1fr;
  }

  .customer-info-grid.three-col {
    grid-template-columns: 1fr;
  }

  .contact-item,
  .address-item {
    grid-column: span 1;
  }
}
</style>
