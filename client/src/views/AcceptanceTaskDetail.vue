<template>
  <div class="acceptance-detail">
    <TaskDetailHeader
      title="验收任务详情"
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
        <TaskOverview :task="task" icon="✅" />

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
            <h2 class="card-title">验收物品</h2>
          </div>
          <div class="card-body">
            <div class="item-info">
              <div class="item-main">
                <div class="item-name">{{ task.itemName }}</div>
                <div class="item-count">× {{ task.itemCount }} 件</div>
              </div>
              <div class="item-time">
                <div class="time-row">
                  <span class="time-label">租赁周期：</span>
                  <span class="time-value">{{ task.rentalStartDate }} ~ {{ task.rentalEndDate }}</span>
                </div>
                <div class="time-row">
                  <span class="time-label">计划验收：</span>
                  <span class="time-value">{{ task.scheduledAcceptanceTime }}</span>
                </div>
                <div v-if="task.actualAcceptanceTime" class="time-row">
                  <span class="time-label">实际验收：</span>
                  <span class="time-value actual">{{ task.actualAcceptanceTime }}</span>
                </div>
                <div v-if="task.damageFee !== undefined && task.damageFee > 0" class="time-row damage-row">
                  <span class="time-label">损坏赔偿：</span>
                  <span class="time-value damage">¥{{ task.damageFee }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <template v-if="task.status !== 'completed'">
          <section class="info-card upload-section">
            <div class="card-header">
              <span class="card-icon">📄</span>
              <h2 class="card-title">验收报告</h2>
              <span class="required-tag">* 必填</span>
            </div>
            <div class="card-body">
              <FileUploader
                v-model="acceptanceReport"
                :max-count="5"
                accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                button-text="上传验收报告"
              />
            </div>
          </section>

          <section class="info-card upload-section">
            <div class="card-header">
              <span class="card-icon">📷</span>
              <h2 class="card-title">设备状态照片</h2>
              <span class="required-tag">* 必填</span>
            </div>
            <div class="card-body">
              <PhotoUploader
                v-model="deviceStatusPhotos"
                :max-count="9"
                :tips="['设备整体外观照片', '关键部件细节特写', '屏幕/接口等易损部位']"
              />
            </div>
          </section>

          <section class="info-card upload-section">
            <div class="card-header">
              <span class="card-icon">📋</span>
              <h2 class="card-title">定损单</h2>
              <span class="optional-tag">选填（如有损坏）</span>
            </div>
            <div class="card-body">
              <FileUploader
                v-model="damageAssessment"
                :max-count="3"
                accept=".pdf,.doc,.docx,image/*"
                button-text="上传定损单"
              />

              <div class="damage-fee-section">
                <div class="damage-fee-label">
                  <span>损坏赔偿金额</span>
                  <span class="optional-hint">（如有损坏请填写）</span>
                </div>
                <div class="damage-fee-input-wrapper">
                  <span class="currency-prefix">¥</span>
                  <input
                    type="number"
                    v-model="damageFee"
                    class="damage-fee-input"
                    placeholder="请输入赔偿金额"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </section>

          <ResultOptions
            title="验收结果"
            v-model="acceptanceResult"
            :required="true"
            :options="acceptanceResultOptions"
          />

          <RemarkSection
            title="验收备注"
            v-model="acceptanceRemark"
            placeholder="请输入验收备注信息，如：设备使用情况、损坏细节说明等..."
            :required="false"
          />
        </template>

        <template v-else>
          <section v-if="task.acceptanceReport && task.acceptanceReport.length > 0" class="info-card files-section">
            <div class="card-header">
              <span class="card-icon">📄</span>
              <h2 class="card-title">验收报告</h2>
            </div>
            <div class="card-body">
              <FileUploader :model-value="task.acceptanceReport" :readonly="true" />
            </div>
          </section>

          <section v-if="task.deviceStatusPhotos && task.deviceStatusPhotos.length > 0" class="info-card photos-section">
            <div class="card-header">
              <span class="card-icon">🖼️</span>
              <h2 class="card-title">设备状态照片</h2>
            </div>
            <div class="card-body">
              <div class="photos-grid">
                <img
                  v-for="(photo, index) in task.deviceStatusPhotos"
                  :key="index"
                  :src="photo"
                  :alt="'设备状态' + (index + 1)"
                  class="photo-thumbnail"
                />
              </div>
            </div>
          </section>

          <section v-if="task.damageAssessment && task.damageAssessment.length > 0" class="info-card files-section">
            <div class="card-header">
              <span class="card-icon">📋</span>
              <h2 class="card-title">定损单</h2>
            </div>
            <div class="card-body">
              <FileUploader :model-value="task.damageAssessment" :readonly="true" />
            </div>
          </section>

          <section class="info-card result-section completed">
            <div class="card-header">
              <span class="card-icon">✅</span>
              <h2 class="card-title">验收记录</h2>
            </div>
            <div class="card-body">
              <div class="result-summary">
                <div class="result-row">
                  <span class="result-label">验收结果：</span>
                  <span class="result-value">{{ task.acceptanceResult || '设备完好，无损坏' }}</span>
                </div>
                <div v-if="task.damageFee > 0" class="result-row">
                  <span class="result-label">损坏赔偿：</span>
                  <span class="result-value damage">¥{{ task.damageFee }}</span>
                </div>
                <div v-if="task.acceptanceRemark" class="result-row">
                  <span class="result-label">验收备注：</span>
                  <span class="result-value">{{ task.acceptanceRemark }}</span>
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
            @click="handleConfirmAcceptance"
          >
            <span v-if="submitting" class="btn-loading"></span>
            <span>{{ submitting ? '提交中...' : '确认验收' }}</span>
          </button>
        </div>
      </div>
    </main>

    <SuccessModal
      v-model="showSuccessModal"
      icon="✅"
      title="验收成功！"
      message="任务已标记为验收通过状态，押金退还任务已自动创建"
      confirm-text="返回列表"
      @confirm="goBack"
    />

    <CopyToast v-model="showCopyTip" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getRentalTaskDetail, confirmAcceptance } from '../api/rentalTask'
import { useTaskDetail } from '../composables/useTaskDetail'
import { useCopyPhone } from '../composables/useCopyPhone'
import TaskDetailHeader from '../components/TaskDetailHeader.vue'
import TaskOverview from '../components/TaskOverview.vue'
import CustomerInfo from '../components/CustomerInfo.vue'
import PhotoUploader from '../components/PhotoUploader.vue'
import FileUploader from '../components/FileUploader.vue'
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
} = useTaskDetail(getRentalTaskDetail, 'acceptance')

const { showCopyTip, copyPhone } = useCopyPhone()

const acceptanceReport = ref([])
const deviceStatusPhotos = ref([])
const damageAssessment = ref([])
const acceptanceResult = ref('')
const damageFee = ref(null)
const acceptanceRemark = ref('')

const acceptanceResultOptions = [
  { value: 'good', icon: '🟢', title: '设备完好', desc: '无损坏，正常回收', type: 'good' },
  { value: 'damaged', icon: '🟡', title: '轻微损坏', desc: '有轻微划痕或小故障', type: 'damaged' },
  { value: 'serious', icon: '🔴', title: '严重损坏', desc: '功能故障或物理损坏严重', type: 'serious' }
]

const resultTextMap = {
  good: '设备完好，无损坏',
  damaged: '设备有轻微损坏',
  serious: '设备严重损坏'
}

const canConfirm = computed(() => {
  return (
    acceptanceReport.value.length > 0 &&
    deviceStatusPhotos.value.length > 0 &&
    acceptanceResult.value !== '' &&
    !submitting.value
  )
})

const handleConfirmAcceptance = async () => {
  if (!canConfirm.value) return

  submitting.value = true
  try {
    const res = await confirmAcceptance(taskId.value, {
      acceptanceReport: acceptanceReport.value,
      deviceStatusPhotos: deviceStatusPhotos.value,
      damageAssessment: damageAssessment.value,
      acceptanceResult: resultTextMap[acceptanceResult.value],
      damageFee: damageFee.value || 0,
      acceptanceRemark: acceptanceRemark.value
    })

    if (res.code === 0) {
      showSuccessModal.value = true
    }
  } catch (error) {
    console.error('确认验收失败:', error)
    alert('确认验收失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchTaskDetail()
})
</script>

<style scoped>
.acceptance-detail {
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
  border-top-color: #f59e0b;
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

.optional-tag {
  color: #9ca3af;
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
  padding: 14px;
  background: #fff7ed;
  border-radius: 8px;
  border: 1px solid #fed7aa;
  flex-wrap: wrap;
  gap: 12px;
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

.time-row.damage-row {
  padding-top: 4px;
  border-top: 1px dashed #fcd34d;
  margin-top: 4px;
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

.time-value.damage {
  color: #dc2626;
  font-weight: 600;
}

.damage-fee-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f1f3;
}

.damage-fee-label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  margin-bottom: 10px;
}

.optional-hint {
  font-size: 12px;
  color: #9ca3af;
  font-weight: normal;
}

.damage-fee-input-wrapper {
  display: flex;
  align-items: center;
  background: #fafbfc;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 0 14px;
  transition: all 0.2s ease;
  max-width: 300px;
}

.damage-fee-input-wrapper:focus-within {
  border-color: #f59e0b;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.currency-prefix {
  font-size: 18px;
  color: #374151;
  font-weight: 600;
  margin-right: 8px;
}

.damage-fee-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 12px 0;
  font-size: 16px;
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
  font-weight: 500;
  color: #111827;
}

.damage-fee-input::placeholder {
  color: #9ca3af;
  font-weight: normal;
  font-family: inherit;
  font-size: 14px;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.photo-thumbnail {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
}

.photo-thumbnail:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.result-summary {
  padding: 16px;
  background: #f6ffed;
  border-radius: 8px;
  border: 1px solid #b7eb8f;
}

.result-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
  line-height: 1.6;
}

.result-row:last-child {
  margin-bottom: 0;
}

.result-label {
  font-size: 14px;
  color: #389e0d;
  font-weight: 500;
  flex-shrink: 0;
}

.result-value {
  font-size: 14px;
  color: #111827;
  flex: 1;
}

.result-value.damage {
  color: #dc2626;
  font-weight: 600;
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
}

.action-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 16px 40px;
  display: flex;
  justify-content: center;
  gap: 14px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.action-btn {
  padding: 12px 36px;
  font-size: 15px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 140px;
}

.cancel-btn {
  background: #ffffff;
  color: #4b5563;
  border-color: #d1d5db;
}

.cancel-btn:hover {
  color: #ef4444;
  border-color: #fca5a5;
  background: #fef2f2;
}

.confirm-btn {
  background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
  color: #ffffff;
  border-color: #d97706;
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.3);
}

.confirm-btn:hover:not(.disabled) {
  background: linear-gradient(135deg, #b45309 0%, #d97706 100%);
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
  transform: translateY(-1px);
}

.confirm-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-loading {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@media (max-width: 768px) {
  .photos-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .action-footer {
    padding: 12px 16px;
  }

  .action-btn {
    min-width: 120px;
    padding: 10px 20px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .photos-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .item-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-time {
    text-align: left;
  }
}
</style>
