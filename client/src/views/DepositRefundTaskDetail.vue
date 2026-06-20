<template>
  <div class="deposit-refund-detail">
    <TaskDetailHeader
      title="押金退还详情"
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
        <TaskOverview :task="task" icon="💰" />

        <CustomerInfo
          :customer="{
            customerName: task.customerName,
            customerContact: task.customerContact,
            customerPhone: task.customerPhone
          }"
        />

        <section class="info-card deposit-section">
          <div class="card-header">
            <span class="card-icon">💵</span>
            <h2 class="card-title">押金信息</h2>
          </div>
          <div class="card-body">
            <div class="deposit-info">
              <div class="deposit-item">
                <div class="deposit-label">租赁物品</div>
                <div class="deposit-value">{{ task.itemName }} × {{ task.itemCount }}</div>
              </div>
              <div class="deposit-item">
                <div class="deposit-label">租赁周期</div>
                <div class="deposit-value">{{ task.rentalStartDate }} ~ {{ task.rentalEndDate }}</div>
              </div>
              <div class="deposit-item highlight">
                <div class="deposit-label">押金总额</div>
                <div class="deposit-value deposit-amount">¥{{ task.depositAmount }}</div>
              </div>
              <div class="deposit-item" v-if="task.damageFee > 0">
                <div class="deposit-label">损坏扣除</div>
                <div class="deposit-value damage-fee">- ¥{{ task.damageFee }}</div>
              </div>
              <div class="deposit-item total">
                <div class="deposit-label">实际退还</div>
                <div class="deposit-value actual-refund">¥{{ task.actualRefundAmount }}</div>
              </div>
            </div>
            <div class="acceptance-result" v-if="task.acceptanceResult">
              <div class="result-label">验收结果</div>
              <div class="result-text">{{ task.acceptanceResult }}</div>
            </div>
          </div>
        </section>

        <template v-if="task.status !== 'completed'">
          <section class="info-card upload-section">
            <div class="card-header">
              <span class="card-icon">📄</span>
              <h2 class="card-title">退款凭证</h2>
              <span class="optional-tag">选填</span>
            </div>
            <div class="card-body">
              <FileUploader
                v-model="refundVoucher"
                :max-count="5"
                accept=".pdf,.doc,.docx,image/*"
                button-text="上传退款凭证"
              />
            </div>
          </section>

          <RemarkSection
            title="退还备注"
            v-model="refundRemark"
            placeholder="请输入退还备注信息，如：退款方式、到账时间说明等..."
            :required="false"
          />
        </template>

        <template v-else>
          <section v-if="task.refundVoucher && task.refundVoucher.length > 0" class="info-card files-section">
            <div class="card-header">
              <span class="card-icon">📄</span>
              <h2 class="card-title">退款凭证</h2>
            </div>
            <div class="card-body">
              <FileUploader :model-value="task.refundVoucher" :readonly="true" />
            </div>
          </section>

          <section class="info-card result-section completed">
            <div class="card-header">
              <span class="card-icon">✅</span>
              <h2 class="card-title">退还记录</h2>
            </div>
            <div class="card-body">
              <div class="result-summary">
                <div class="result-row">
                  <span class="result-label">退还时间：</span>
                  <span class="result-value">{{ task.actualRefundTime }}</span>
                </div>
                <div class="result-row">
                  <span class="result-label">实际退还金额：</span>
                  <span class="result-value success">¥{{ task.actualRefundAmount }}</span>
                </div>
                <div v-if="task.refundRemark" class="result-row">
                  <span class="result-label">退还备注：</span>
                  <span class="result-value">{{ task.refundRemark }}</span>
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
            @click="handleConfirmRefund"
          >
            <span v-if="submitting" class="btn-loading"></span>
            <span>{{ submitting ? '提交中...' : '确认退还' }}</span>
          </button>
        </div>
      </div>
    </main>

    <SuccessModal
      v-model="showSuccessModal"
      icon="💰"
      title="押金退还成功！"
      message="押金已确认退还，任务已完成"
      confirm-text="返回列表"
      @confirm="goBack"
    />

    <CopyToast v-model="showCopyTip" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getRentalTaskDetail, confirmDepositRefund } from '../api/rentalTask'
import { useTaskDetail } from '../composables/useTaskDetail'
import { useCopyPhone } from '../composables/useCopyPhone'
import TaskDetailHeader from '../components/TaskDetailHeader.vue'
import TaskOverview from '../components/TaskOverview.vue'
import CustomerInfo from '../components/CustomerInfo.vue'
import FileUploader from '../components/FileUploader.vue'
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
} = useTaskDetail(getRentalTaskDetail, 'depositRefund')

const { showCopyTip, copyPhone } = useCopyPhone()

const refundVoucher = ref([])
const refundRemark = ref('')

const canConfirm = computed(() => {
  return !submitting.value
})

const handleConfirmRefund = async () => {
  if (!canConfirm.value) return

  submitting.value = true
  try {
    const res = await confirmDepositRefund(taskId.value, {
      refundVoucher: refundVoucher.value,
      refundRemark: refundRemark.value
    })

    if (res.code === 0) {
      showSuccessModal.value = true
    }
  } catch (error) {
    console.error('确认押金退还失败:', error)
    alert('确认押金退还失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchTaskDetail()
})
</script>

<style scoped>
.deposit-refund-detail {
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
  border-top-color: #10b981;
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
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
}

.card-body {
  padding: 20px;
}

.deposit-info {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.deposit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed #a7f3d0;
}

.deposit-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.deposit-item:first-child {
  padding-top: 0;
}

.deposit-item.highlight {
  padding: 12px 0;
}

.deposit-item.total {
  padding: 12px 0;
  margin-top: 4px;
}

.deposit-label {
  font-size: 14px;
  color: #065f46;
  font-weight: 500;
}

.deposit-value {
  font-size: 14px;
  color: #065f46;
  font-weight: 500;
}

.deposit-amount {
  font-size: 18px;
  font-weight: 700;
  color: #047857;
}

.damage-fee {
  color: #dc2626;
  font-weight: 600;
}

.actual-refund {
  font-size: 20px;
  font-weight: 700;
  color: #059669;
}

.acceptance-result {
  padding: 12px 14px;
  background: #f0fdf4;
  border-radius: 8px;
  border-left: 3px solid #10b981;
}

.result-label {
  font-size: 13px;
  color: #065f46;
  font-weight: 500;
  margin-bottom: 4px;
}

.result-text {
  font-size: 14px;
  color: #065f46;
  line-height: 1.5;
}

.result-summary {
  padding: 16px;
  background: #f0fdf4;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
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
  color: #065f46;
  font-weight: 500;
  flex-shrink: 0;
}

.result-value {
  font-size: 14px;
  color: #111827;
  flex: 1;
}

.result-value.success {
  color: #059669;
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
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: #ffffff;
  border-color: #059669;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
}

.confirm-btn:hover:not(.disabled) {
  background: linear-gradient(135deg, #047857 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
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
  .action-footer {
    padding: 12px 16px;
  }

  .action-btn {
    min-width: 120px;
    padding: 10px 20px;
    font-size: 14px;
  }
}
</style>
