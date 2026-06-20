<template>
  <div class="repair-detail">
    <header class="page-header">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          <span>返回列表</span>
        </div>
        <div class="header-title">
          <h1 class="page-title">报修任务详情</h1>
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
            <span class="card-icon">🔧</span>
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
              <div class="photo-upload-area">
                <div
                  v-for="(photo, index) in repairPhotos"
                  :key="index"
                  class="photo-item"
                >
                  <img :src="photo" alt="维修照片" class="photo-preview" />
                  <button class="photo-delete" @click="removeRepairPhoto(index)">
                    <span>×</span>
                  </button>
                </div>
                <label v-if="repairPhotos.length < 9" class="photo-upload-btn">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    @change="handleRepairPhotoUpload"
                    hidden
                  />
                  <div class="upload-icon">📸</div>
                  <div class="upload-text">上传照片</div>
                  <div class="upload-hint">最多9张</div>
                </label>
              </div>
            </div>
          </section>

          <section class="info-card result-section">
            <div class="card-header">
              <span class="card-icon">✅</span>
              <h2 class="card-title">维修结果</h2>
              <span class="required-tag">* 必填</span>
            </div>
            <div class="card-body">
              <div class="result-options">
                <label
                  class="result-option"
                  :class="{ active: repairResult === 'fixed' }"
                >
                  <input
                    type="radio"
                    v-model="repairResult"
                    value="fixed"
                    hidden
                  />
                  <div class="option-icon good-icon">🟢</div>
                  <div class="option-content">
                    <div class="option-title">已修复</div>
                    <div class="option-desc">设备故障已排除，恢复正常</div>
                  </div>
                  <div class="option-check" v-if="repairResult === 'fixed'">✓</div>
                </label>

                <label
                  class="result-option"
                  :class="{ active: repairResult === 'partial' }"
                >
                  <input
                    type="radio"
                    v-model="repairResult"
                    value="partial"
                    hidden
                  />
                  <div class="option-icon damaged-icon">🟡</div>
                  <div class="option-content">
                    <div class="option-title">部分修复</div>
                    <div class="option-desc">主要问题解决，仍有小问题</div>
                  </div>
                  <div class="option-check" v-if="repairResult === 'partial'">✓</div>
                </label>

                <label
                  class="result-option"
                  :class="{ active: repairResult === 'unfixable' }"
                >
                  <input
                    type="radio"
                    v-model="repairResult"
                    value="unfixable"
                    hidden
                  />
                  <div class="option-icon serious-icon">🔴</div>
                  <div class="option-content">
                    <div class="option-title">无法修复</div>
                    <div class="option-desc">设备损坏严重，需要更换</div>
                  </div>
                  <div class="option-check" v-if="repairResult === 'unfixable'">✓</div>
                </label>
              </div>
            </div>
          </section>

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

          <section class="info-card remark-section">
            <div class="card-header">
              <span class="card-icon">📝</span>
              <h2 class="card-title">维修备注</h2>
              <span class="optional-tag">选填</span>
            </div>
            <div class="card-body">
              <textarea
                v-model="repairRemark"
                class="remark-textarea"
                placeholder="请输入维修备注信息，如：更换的零部件、维修过程说明等..."
                rows="4"
              ></textarea>
            </div>
          </section>
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

    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="modal-content success-modal" @click.stop>
        <div class="success-icon">✅</div>
        <h3 class="success-title">维修完成！</h3>
        <p class="success-message">任务已标记为维修完成状态，售后中状态已关闭</p>
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
import { getRentalTaskDetail, confirmRepair } from '../api/rentalTask'

const route = useRoute()
const router = useRouter()

const taskId = computed(() => route.params.id)
const task = ref(null)
const loading = ref(true)
const submitting = ref(false)
const repairPhotos = ref([])
const repairResult = ref('')
const repairCost = ref(null)
const repairRemark = ref('')
const showSuccessModal = ref(false)
const showCopyTip = ref(false)

const resultTextMap = {
  fixed: '设备故障已排除，恢复正常',
  partial: '主要问题解决，仍有小问题',
  unfixable: '设备损坏严重，需要更换'
}

const priorityText = computed(() => {
  if (!task.value) return ''
  const map = { high: '高优先', medium: '中优先', low: '低优先' }
  return map[task.value.priority] || '普通'
})

const canConfirm = computed(() => {
  return repairResult.value !== '' && !submitting.value
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
  router.push('/rental-tasks?type=repair')
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

const handleRepairPhotoUpload = (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  const remainingSlots = 9 - repairPhotos.value.length
  const filesToProcess = Array.from(files).slice(0, remainingSlots)

  filesToProcess.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      repairPhotos.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
  })

  event.target.value = ''
}

const removeRepairPhoto = (index) => {
  repairPhotos.value.splice(index, 1)
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}

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

.page-header {
  background: linear-gradient(135deg, #7c2d12 0%, #c2410c 60%, #f97316 100%);
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

.required-tag {
  color: #dc2626;
  font-size: 12px;
  font-weight: 500;
}

.optional-tag {
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
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

.card-body {
  padding: 20px;
}

.task-overview .task-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.task-overview .task-description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 16px 0;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  border-left: 3px solid #f97316;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
  color: #4b5563;
}

.meta-item {
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
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
}

.contact-item {
  grid-column: span 2;
  position: relative;
}

.info-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
}

.phone-icon {
  background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%);
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
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.phone-number {
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
}

.contact-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.contact-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.call-btn {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #ffffff;
  border-color: #16a34a;
}

.call-btn:hover {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.sms-btn {
  background: #ffffff;
  color: #4b5563;
  border-color: #d1d5db;
}

.sms-btn:hover {
  color: #f97316;
  border-color: #fdba74;
  background: #fff7ed;
}

.btn-icon {
  font-size: 16px;
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

.photo-upload-area {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.photo-item {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
}

.photo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-delete {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.9);
  color: #ffffff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
  transition: all 0.2s ease;
}

.photo-delete:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.photo-upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  aspect-ratio: 1;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s ease;
}

.photo-upload-btn:hover {
  border-color: #f97316;
  background: #fff7ed;
}

.upload-icon {
  font-size: 28px;
}

.upload-text {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

.upload-hint {
  font-size: 11px;
  color: #9ca3af;
}

.result-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.result-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  background: #ffffff;
}

.result-option:hover {
  border-color: #fdba74;
  background: #fff7ed;
}

.result-option.active {
  border-color: #f97316;
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.15);
}

.option-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.option-content {
  flex: 1;
  min-width: 0;
}

.option-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.option-desc {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.option-check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
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

.remark-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  color: #111827;
  resize: vertical;
  transition: all 0.2s ease;
  box-sizing: border-box;
  font-family: inherit;
}

.remark-textarea:focus {
  outline: none;
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.remark-textarea::placeholder {
  color: #9ca3af;
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #ffffff;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalIn 0.3s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.success-modal .success-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin: 0 auto 20px;
  box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3);
}

.success-modal .success-title {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px 0;
}

.success-modal .success-message {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 24px 0;
}

.success-btn {
  width: 100%;
  padding: 14px 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.success-btn:hover {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.4);
}

.copy-toast {
  position: fixed;
  bottom: 80px;
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

  .contact-item {
    grid-column: span 1;
  }

  .result-options {
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

@media (max-width: 480px) {
  .page-title {
    font-size: 22px;
  }

  .card-body {
    padding: 16px;
  }
}
</style>
