<template>
  <div class="delivery-detail">
    <TaskDetailHeader
      title="交付任务详情"
      :task-id="taskId"
      :gradient="typeConfig?.gradient"
      @back="goBack"
    />

    <main class="page-main">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="task" class="detail-content">
        <TaskOverview :task="task" icon="🚚" />

        <CustomerInfo
          :customer="{
            customerName: task.customerName,
            customerContact: task.customerContact,
            customerPhone: task.customerPhone
          }"
          :show-address="true"
          :customer-address="task.deliveryAddress"
          address-label="配送地址"
          :show-map-button="true"
        />

        <section class="info-card item-section">
          <div class="card-header">
            <span class="card-icon">📦</span>
            <h2 class="card-title">交付物品</h2>
          </div>
          <div class="card-body">
            <div class="item-info">
              <div class="item-main">
                <div class="item-name">{{ task.itemName }}</div>
                <div class="item-count">× {{ task.itemCount }} 件</div>
              </div>
              <div class="item-time">
                <div class="time-row">
                  <span class="time-label">计划交付：</span>
                  <span class="time-value">{{ task.scheduledDeliveryTime }}</span>
                </div>
                <div v-if="task.actualDeliveryTime" class="time-row">
                  <span class="time-label">实际交付：</span>
                  <span class="time-value actual">{{ task.actualDeliveryTime }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section v-if="task.status !== 'completed'" class="info-card upload-section">
          <div class="card-header">
            <span class="card-icon">📷</span>
            <h2 class="card-title">交付现场凭证</h2>
            <span class="required-tag">* 必填</span>
          </div>
          <div class="card-body">
            <PhotoUploader
              v-model="deliveryPhotos"
              :max-count="9"
              :tips="['物品全貌照片', '客户签收场景', '物品细节照片']"
            />
          </div>
        </section>

        <section v-if="task.status === 'completed' && task.deliveryPhotos && task.deliveryPhotos.length > 0" class="info-card photos-section">
          <div class="card-header">
            <span class="card-icon">🖼️</span>
            <h2 class="card-title">交付凭证照片</h2>
          </div>
          <div class="card-body">
            <div class="photos-grid">
              <img
                v-for="(photo, index) in task.deliveryPhotos"
                :key="index"
                :src="photo"
                :alt="'交付凭证' + (index + 1)"
                class="photo-thumbnail"
              />
            </div>
            <div v-if="task.deliveryRemark" class="delivery-remark">
              <div class="remark-label">交付备注：</div>
              <div class="remark-content">{{ task.deliveryRemark }}</div>
            </div>
          </div>
        </section>

        <RemarkSection
          v-if="task.status !== 'completed'"
          title="交付备注"
          v-model="deliveryRemark"
          placeholder="请输入交付备注信息，如：物品完好无损、客户满意等..."
          :required="false"
        />

        <div v-if="task.status !== 'completed'" class="action-footer">
          <button class="action-btn cancel-btn" @click="goBack">
            取消
          </button>
          <button
            class="action-btn confirm-btn"
            :class="{ disabled: !canConfirm }"
            :disabled="!canConfirm || submitting"
            @click="handleConfirmDelivery"
          >
            <span v-if="submitting" class="btn-loading"></span>
            <span>{{ submitting ? '提交中...' : '确认交付' }}</span>
          </button>
        </div>
      </div>
    </main>

    <SuccessModal
      v-model="showSuccessModal"
      icon="🚚"
      title="交付成功！"
      message="任务已标记为已交付状态，租赁中任务已自动创建"
      confirm-text="返回列表"
      @confirm="goBack"
    />

    <CopyToast v-model="showCopyTip" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getRentalTaskDetail, confirmDelivery } from '../api/rentalTask'
import { useTaskDetail } from '../composables/useTaskDetail'
import { useCopyPhone } from '../composables/useCopyPhone'
import TaskDetailHeader from '../components/TaskDetailHeader.vue'
import TaskOverview from '../components/TaskOverview.vue'
import CustomerInfo from '../components/CustomerInfo.vue'
import PhotoUploader from '../components/PhotoUploader.vue'
import RemarkSection from '../components/RemarkSection.vue'
import SuccessModal from '../components/SuccessModal.vue'
import CopyToast from '../components/CopyToast.vue'

const {
  taskId,
  task,
  loading,
  submitting,
  showSuccessModal,
  typeConfig,
  fetchTaskDetail,
  goBack,
  closeSuccessModal
} = useTaskDetail(getRentalTaskDetail, 'delivery')

const { showCopyTip, copyPhone } = useCopyPhone()

const deliveryPhotos = ref([])
const deliveryRemark = ref('')

const canConfirm = computed(() => {
  return deliveryPhotos.value.length > 0 && !submitting.value
})

const handleConfirmDelivery = async () => {
  if (!canConfirm.value) return

  submitting.value = true
  try {
    const res = await confirmDelivery(taskId.value, {
      deliveryPhotos: deliveryPhotos.value,
      deliveryRemark: deliveryRemark.value
    })

    if (res.code === 0) {
      showSuccessModal.value = true
    }
  } catch (error) {
    console.error('确认交付失败:', error)
    alert('确认交付失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchTaskDetail()
})
</script>

<style scoped>
.delivery-detail {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 100px;
}

.page-main {
  max-width: 900px;
  margin: -16px auto 0;
  padding: 0 20px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #9ca3af;
  font-size: 15px;
  margin: 0;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

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

.required-tag {
  color: #ef4444;
  font-size: 12px;
  font-weight: 500;
}

.card-body {
  padding: 20px;
}

.item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  background: #fffbeb;
  border-radius: 8px;
  border: 1px solid #fde68a;
}

.item-main {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #92400e;
}

.item-count {
  font-size: 14px;
  color: #b45309;
  font-weight: 500;
}

.item-time {
  text-align: right;
}

.time-row {
  font-size: 13px;
  color: #92400e;
  margin-bottom: 4px;
}

.time-row:last-child {
  margin-bottom: 0;
}

.time-label {
  color: #b45309;
}

.time-value {
  font-weight: 500;
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
}

.time-value.actual {
  color: #16a34a;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.photo-thumbnail {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.photo-thumbnail:hover {
  transform: scale(1.02);
}

.delivery-remark {
  padding: 14px 16px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}

.remark-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
  font-weight: 500;
}

.remark-content {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
}

.action-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: #ffffff;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: center;
  gap: 16px;
  z-index: 100;
}

.action-btn {
  padding: 12px 32px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 140px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.cancel-btn {
  background: #ffffff;
  color: #4b5563;
  border-color: #d1d5db;
}

.cancel-btn:hover {
  color: #1f2937;
  border-color: #9ca3af;
  background: #f9fafb;
}

.confirm-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.confirm-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
  transform: translateY(-1px);
}

.confirm-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.confirm-btn.disabled:hover {
  transform: none;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-loading {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@media (max-width: 640px) {
  .photos-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .item-info {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .item-time {
    text-align: left;
  }

  .action-footer {
    padding: 12px 16px;
  }

  .action-btn {
    flex: 1;
    min-width: auto;
  }
}
</style>
