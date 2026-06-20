<template>
  <div class="repair-detail">
    <TaskDetailHeader
      title="报修任务详情"
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
        <TaskOverview :task="task" icon="🔧" />

        <CustomerInfo
          :customer="{
            customerName: task.customerName,
            customerContact: task.customerContact,
            customerPhone: task.customerPhone
          }"
        />

        <section class="info-card item-section">
          <div class="card-header">
            <span class="card-icon">📦</span>
            <h2 class="card-title">维修设备</h2>
          </div>
          <div class="card-body">
            <div class="item-info">
              <div class="item-main">
                <div class="item-name">{{ task.itemName }}</div>
                <div class="item-count">× {{ task.itemCount }} 件</div>
              </div>
              <div class="item-time">
                <div class="time-row">
                  <span class="time-label">计划维修：</span>
                  <span class="time-value">{{ task.scheduledRepairTime }}</span>
                </div>
                <div v-if="task.actualRepairTime" class="time-row">
                  <span class="time-label">实际维修：</span>
                  <span class="time-value actual">{{ task.actualRepairTime }}</span>
                </div>
                <div v-if="task.repairCost > 0" class="time-row repair-cost-row">
                  <span class="time-label">维修费用：</span>
                  <span class="time-value repair-cost">¥{{ task.repairCost }}</span>
                </div>
              </div>
            </div>
            <div class="fault-description" v-if="task.faultDescription">
              <div class="fault-label">
                <span class="fault-icon">⚠️</span>
                <span>故障描述</span>
              </div>
              <div class="fault-content">{{ task.faultDescription }}</div>
            </div>
          </div>
        </section>

        <template v-if="task.status !== 'completed'">
          <section class="info-card upload-section">
            <div class="card-header">
              <span class="card-icon">📷</span>
              <h2 class="card-title">维修现场照片</h2>
              <span class="optional-tag">选填</span>
            </div>
            <div class="card-body">
              <PhotoUploader v-model="repairPhotos" :max-count="9" />
            </div>
          </section>

          <ResultOptions
            title="维修结果"
            v-model="repairResult"
            :required="true"
            :options="repairResultOptions"
          />

          <section class="info-card cost-section">
            <div class="card-header">
              <span class="card-icon">💰</span>
              <h2 class="card-title">维修费用</h2>
              <span class="optional-tag">选填</span>
            </div>
            <div class="card-body">
              <div class="cost-input-wrapper">
                <span class="currency-prefix">¥</span>
                <input
                  type="number"
                  v-model="repairCost"
                  class="cost-input"
                  placeholder="请输入维修费用"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </section>

          <RemarkSection
            title="维修备注"
            v-model="repairRemark"
            placeholder="请输入维修备注信息，如：更换的零部件、维修过程说明等..."
            :required="false"
          />
        </template>

        <template v-else>
          <section v-if="task.repairPhotos && task.repairPhotos.length > 0" class="info-card photos-section">
            <div class="card-header">
              <span class="card-icon">🖼️</span>
              <h2 class="card-title">维修现场照片</h2>
            </div>
            <div class="card-body">
              <div class="photos-grid">
                <img
                  v-for="(photo, index) in task.repairPhotos"
                  :key="index"
                  :src="photo"
                  :alt="'维修照片' + (index + 1)"
                  class="photo-thumbnail"
                />
              </div>
            </div>
          </section>

          <section class="info-card result-section completed">
            <div class="card-header">
              <span class="card-icon">✅</span>
              <h2 class="card-title">维修记录</h2>
            </div>
            <div class="card-body">
              <div class="result-summary">
                <div class="result-row">
                  <span class="result-label">维修结果：</span>
                  <span class="result-value">{{ task.repairResult || '设备已维修完成' }}</span>
                </div>
                <div v-if="task.repairCost > 0" class="result-row">
                  <span class="result-label">维修费用：</span>
                  <span class="result-value damage">¥{{ task.repairCost }}</span>
                </div>
                <div v-if="task.repairRemark" class="result-row">
                  <span class="result-label">维修备注：</span>
                  <span class="result-value">{{ task.repairRemark }}</span>
                </div>
              </div>
            </div>
          </section>
        </template>

        <div v-if="task.status !== 'completed'" class="action-footer">
          <button class="action-btn cancel-btn" @click="goBack">
            取消
          </button>
          <button
            class="action-btn confirm-btn"
            :class="{ disabled: !canConfirm }"
            :disabled="!canConfirm || submitting"
            @click="handleConfirmRepair"
          >
            <span v-if="submitting" class="btn-loading"></span>
            <span>{{ submitting ? '提交中...' : '确认维修完成' }}</span>
          </button>
        </div>
      </div>
    </main>

    <SuccessModal
      v-model="showSuccessModal"
      icon="🔧"
      title="维修完成！"
      message="任务已标记为维修完成状态，售后中状态已关闭"
      confirm-text="返回列表"
      @confirm="goBack"
    />

    <CopyToast v-model="showCopyTip" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getRentalTaskDetail, confirmRepair } from '../api/rentalTask'
import { useTaskDetail } from '../composables/useTaskDetail'
import { useCopyPhone } from '../composables/useCopyPhone'
import TaskDetailHeader from '../components/TaskDetailHeader.vue'
import TaskOverview from '../components/TaskOverview.vue'
import CustomerInfo from '../components/CustomerInfo.vue'
import PhotoUploader from '../components/PhotoUploader.vue'
import ResultOptions from '../components/ResultOptions.vue'
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
} = useTaskDetail(getRentalTaskDetail, 'repair')

const { showCopyTip, copyPhone } = useCopyPhone()

const repairPhotos = ref([])
const repairResult = ref('')
const repairCost = ref(null)
const repairRemark = ref('')

const repairResultOptions = [
  { value: 'fixed', icon: '🟢', title: '已修复', desc: '设备故障已排除，恢复正常', type: 'good' },
  { value: 'partial', icon: '🟡', title: '部分修复', desc: '主要问题解决，仍有小问题', type: 'damaged' },
  { value: 'unfixable', icon: '🔴', title: '无法修复', desc: '设备损坏严重，需要更换', type: 'serious' }
]

const resultTextMap = {
  fixed: '设备故障已排除，恢复正常',
  partial: '主要问题解决，仍有小问题',
  unfixable: '设备损坏严重，需要更换'
}

const canConfirm = computed(() => {
  return repairResult.value !== '' && !submitting.value
})

const handleConfirmRepair = async () => {
  if (!canConfirm.value) return

  submitting.value = true
  try {
    const res = await confirmRepair(taskId.value, {
      repairResult: resultTextMap[repairResult.value],
      repairCost: repairCost.value || 0,
      repairPhotos: repairPhotos.value,
      repairRemark: repairRemark.value
    })
    if (res.code === 0) {
      showSuccessModal.value = true
    }
  } catch (error) {
    console.error('确认维修失败:', error)
    alert('确认维修失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchTaskDetail()
})
</script>

<style scoped>
.repair-detail {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 120px;
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
  border-top-color: #f97316;
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

.optional-tag {
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
}

.card-body {
  padding: 20px;
}

.item-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #e5e7eb;
}

.item-main {
  flex: 1;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.item-count {
  font-size: 13px;
  color: #6b7280;
}

.item-time {
  flex-shrink: 0;
  text-align: right;
}

.time-row {
  font-size: 13px;
  margin-bottom: 6px;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}

.time-row:last-child {
  margin-bottom: 0;
}

.time-label {
  color: #9ca3af;
}

.time-value {
  color: #374151;
  font-weight: 500;
}

.time-value.actual {
  color: #16a34a;
}

.repair-cost-row .time-value.repair-cost {
  color: #dc2626;
  font-weight: 600;
}

.fault-description {
  margin-top: 16px;
  padding: 14px 16px;
  background: #fff7ed;
  border-radius: 8px;
  border: 1px solid #fed7aa;
}

.fault-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #c2410c;
  margin-bottom: 8px;
}

.fault-icon {
  font-size: 14px;
}

.fault-content {
  font-size: 13px;
  color: #7c2d12;
  line-height: 1.6;
}

.cost-input-wrapper {
  position: relative;
  max-width: 300px;
}

.currency-prefix {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.cost-input {
  width: 100%;
  padding: 14px 16px 14px 36px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  color: #111827;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.cost-input:focus {
  outline: none;
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.photo-thumbnail {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.result-section.completed .result-summary {
  padding: 0;
}

.result-row {
  display: flex;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px dashed #f0f0f0;
}

.result-row:last-child {
  border-bottom: none;
}

.result-label {
  color: #9ca3af;
  font-size: 13px;
  flex-shrink: 0;
  min-width: 80px;
}

.result-value {
  color: #111827;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.6;
}

.result-value.damage {
  color: #dc2626;
  font-weight: 600;
}

.action-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 16px 40px;
  display: flex;
  gap: 12px;
  justify-content: center;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.action-btn {
  padding: 14px 32px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
  justify-content: center;
}

.cancel-btn {
  background: #f3f4f6;
  color: #4b5563;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.confirm-btn {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.confirm-btn:hover:not(.disabled):not(:disabled) {
  background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4);
}

.confirm-btn.disabled,
.confirm-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-loading {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@media (max-width: 768px) {
  .customer-info-grid {
    grid-template-columns: 1fr;
  }

  .item-info {
    flex-direction: column;
    gap: 12px;
  }

  .item-time {
    text-align: left;
  }

  .time-row {
    justify-content: flex-start;
  }

  .action-footer {
    padding: 12px 20px;
  }

  .action-btn {
    min-width: 0;
    flex: 1;
    padding: 12px 20px;
  }
}
</style>
