<template>
  <div class="deposit-refund-detail">
    <header class="page-header">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          <span>返回列表</span>
        </div>
        <div class="header-title">
          <h1 class="page-title">押金退还详情</h1>
          <p class="page-subtitle">
            任务编号：<span class="task-id">#{{ taskId }}</span>
          </p>
        </div>
      </div>
    </header>

    <main class="page-main">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="task" class="detail-content">
        <section class="info-card task-overview">
          <div class="card-header">
            <span class="card-icon">💰</span>
            <h2 class="card-title">任务概况</h2>
            <span class="status-badge" :class="task.status">
              {{ task.statusText }}
            </span>
          </div>
          <div class="card-body">
            <h3 class="task-title">{{ task.title }}</h3>
            <p class="task-description">{{ task.description }}</p>
            <div class="task-meta">
              <span class="meta-item">
                <span class="meta-label">优先级：</span>
                <span class="priority-tag" :class="task.priority">
                  {{ priorityText }}
                </span>
              </span>
              <span class="meta-item">
                <span class="meta-label">创建时间：</span>
                {{ task.createTime }}
              </span>
              <span class="meta-item">
                <span class="meta-label">负责人：</span>
                {{ task.assignee }}
              </span>
            </div>
          </div>
        </section>

        <section class="info-card customer-section">
          <div class="card-header">
            <span class="card-icon">👤</span>
            <h2 class="card-title">客户信息</h2>
          </div>
          <div class="card-body">
            <div class="customer-info-grid">
              <div class="info-item">
                <div class="info-icon-wrapper">
                  <span class="info-icon">🏢</span>
                </div>
                <div class="info-content">
                  <div class="info-label">客户名称</div>
                  <div class="info-value">{{ task.customerName }}</div>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon-wrapper">
                  <span class="info-icon">👤</span>
                </div>
                <div class="info-content">
                  <div class="info-label">联系人</div>
                  <div class="info-value">{{ task.customerContact }}</div>
                </div>
              </div>
              <div class="info-item contact-item">
                <div class="info-icon-wrapper phone-icon">
                  <span class="info-icon">📞</span>
                </div>
                <div class="info-content">
                  <div class="info-label">联系电话</div>
                  <div class="info-value phone-number">{{ task.customerPhone }}</div>
                </div>
                <div class="contact-actions">
                  <a :href="'tel:' + task.customerPhone" class="contact-btn call-btn">
                    <span class="btn-icon">📱</span>
                    <span>拨打电话</span>
                  </a>
                  <button class="contact-btn sms-btn" @click="copyPhone">
                    <span class="btn-icon">📋</span>
                    <span>复制号码</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

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
              <div class="file-list">
                <div
                  v-for="(file, index) in refundVoucher"
                  :key="index"
                  class="file-item"
                >
                  <div class="file-icon">🧾</div>
                  <div class="file-info">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-size">{{ formatFileSize(file.size) }}</div>
                  </div>
                  <button class="file-delete" @click="removeVoucher(index)">
                    <span>×</span>
                  </button>
                </div>
              </div>
              <label v-if="refundVoucher.length < 5" class="file-upload-btn">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  multiple
                  @change="handleVoucherUpload"
                  hidden
                />
                <div class="upload-icon">📤</div>
                <div class="upload-text">上传退款凭证</div>
                <div class="upload-hint">支持PDF/Word/图片，最多5个</div>
              </label>
            </div>
          </section>

          <section class="info-card remark-section">
            <div class="card-header">
              <span class="card-icon">📝</span>
              <h2 class="card-title">退还备注</h2>
              <span class="optional-tag">选填</span>
            </div>
            <div class="card-body">
              <textarea
                v-model="refundRemark"
                class="remark-textarea"
                placeholder="请输入退还备注信息，如：退款方式、到账时间说明等..."
                rows="4"
              ></textarea>
            </div>
          </section>
        </template>

        <template v-else>
          <section v-if="task.refundVoucher && task.refundVoucher.length > 0" class="info-card files-section">
            <div class="card-header">
              <span class="card-icon">📄</span>
              <h2 class="card-title">退款凭证</h2>
            </div>
            <div class="card-body">
              <div class="file-list">
                <div
                  v-for="(file, index) in task.refundVoucher"
                  :key="index"
                  class="file-item completed"
                >
                  <div class="file-icon">🧾</div>
                  <div class="file-info">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-size">{{ formatFileSize(file.size) }}</div>
                  </div>
                </div>
              </div>
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

    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="modal-content success-modal" @click.stop>
        <div class="success-icon">💰</div>
        <h3 class="success-title">押金退还成功！</h3>
        <p class="success-message">押金已确认退还，任务已完成</p>
        <button class="success-btn" @click="goBack">返回列表</button>
      </div>
    </div>

    <div v-if="showCopyTip" class="copy-toast">
      号码已复制到剪贴板
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRentalTaskDetail, confirmDepositRefund } from '../api/rentalTask'

const route = useRoute()
const router = useRouter()

const taskId = computed(() => route.params.id)
const task = ref(null)
const loading = ref(true)
const submitting = ref(false)
const refundVoucher = ref([])
const refundRemark = ref('')
const showSuccessModal = ref(false)
const showCopyTip = ref(false)

const priorityText = computed(() => {
  if (!task.value) return ''
  const map = { high: '高优先', medium: '中优先', low: '低优先' }
  return map[task.value.priority] || '普通'
})

const canConfirm = computed(() => {
  return !submitting.value
})

const fetchTaskDetail = async () => {
  loading.value = true
  try {
    const res = await getRentalTaskDetail(taskId.value)
    if (res.code === 0) {
      task.value = res.data
    }
  } catch (error) {
    console.error('获取任务详情失败:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/rental-tasks?type=depositRefund')
}

const readFileAsDataURL = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve({
        name: file.name,
        size: file.size,
        data: e.target.result
      })
    }
    reader.readAsDataURL(file)
  })
}

const handleVoucherUpload = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  const remainingSlots = 5 - refundVoucher.value.length
  const filesToProcess = Array.from(files).slice(0, remainingSlots)

  for (const file of filesToProcess) {
    const fileData = await readFileAsDataURL(file)
    refundVoucher.value.push(fileData)
  }

  event.target.value = ''
}

const removeVoucher = (index) => {
  refundVoucher.value.splice(index, 1)
}

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const copyPhone = () => {
  if (task.value && task.value.customerPhone) {
    navigator.clipboard.writeText(task.value.customerPhone).then(() => {
      showCopyTip.value = true
      setTimeout(() => {
        showCopyTip.value = false
      }, 2000)
    }).catch(() => {
      const input = document.createElement('input')
      input.value = task.value.customerPhone
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      showCopyTip.value = true
      setTimeout(() => {
        showCopyTip.value = false
      }, 2000)
    })
  }
}

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

const closeSuccessModal = () => {
  showSuccessModal.value = false
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

.page-header {
  background: linear-gradient(135deg, #065f46 0%, #059669 60%, #10b981 100%);
  color: #ffffff;
  padding: 24px 40px 32px;
}

.header-content {
  max-width: 900px;
  margin: 0 auto;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  margin-bottom: 16px;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.back-icon {
  font-size: 16px;
}

.header-title {
  text-align: center;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.task-id {
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
  font-weight: 600;
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

.status-badge {
  padding: 4px 14px;
  font-size: 12px;
  border-radius: 12px;
  font-weight: 500;
}

.status-badge.pending {
  background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%);
  color: #d46b08;
}

.status-badge.processing {
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  color: #096dd9;
}

.status-badge.completed {
  background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
  color: #389e0d;
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

.task-overview .task-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.task-description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 16px 0;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  border-left: 3px solid #e5e7eb;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.meta-item {
  font-size: 13px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-label {
  color: #9ca3af;
}

.priority-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
  font-weight: 500;
}

.priority-tag.high {
  background: #fff1f0;
  color: #f5222d;
}

.priority-tag.medium {
  background: #fff7e6;
  color: #fa8c16;
}

.priority-tag.low {
  background: #f0f0f0;
  color: #595959;
}

.customer-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #f0f1f3;
}

.contact-item {
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
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.info-icon-wrapper.phone-icon {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
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

.contact-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-btn {
  display: inline-flex;
  align-items: center;
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
  color: #10b981;
  border-color: #6ee7b7;
  background: #ecfdf5;
}

.btn-icon {
  font-size: 14px;
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

.file-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #f0f1f3;
  position: relative;
}

.file-item.completed {
  cursor: default;
}

.file-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  color: #111827;
  font-weight: 500;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: #9ca3af;
}

.file-delete {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: #fef2f2;
  color: #ef4444;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.file-delete:hover {
  background: #fee2e2;
  transform: scale(1.1);
}

.file-upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  border: 2px dashed #6ee7b7;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ecfdf5;
}

.file-upload-btn:hover {
  border-color: #10b981;
  background: #d1fae5;
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  color: #065f46;
  font-weight: 500;
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 12px;
  color: #047857;
  opacity: 0.8;
}

.remark-textarea {
  width: 100%;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 14px;
  color: #111827;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
  box-sizing: border-box;
}

.remark-textarea:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.remark-textarea::placeholder {
  color: #9ca3af;
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
  padding: 20px;
}

.modal-content {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  max-width: 360px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.success-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.success-title {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.success-message {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.success-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.success-btn:hover {
  background: linear-gradient(135deg, #047857 0%, #059669 100%);
  transform: translateY(-1px);
}

.copy-toast {
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 1000;
  animation: fadeInOut 2s ease;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0; transform: translateX(-50%) translateY(10px); }
  20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
}

@media (max-width: 768px) {
  .page-header {
    padding: 16px 20px 24px;
  }

  .customer-info-grid {
    grid-template-columns: 1fr;
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
</style>
