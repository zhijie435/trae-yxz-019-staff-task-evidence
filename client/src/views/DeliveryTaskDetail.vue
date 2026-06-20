<template>
  <div class="delivery-detail">
    <header class="page-header">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          <span>返回列表</span>
        </div>
        <div class="header-title">
          <h1 class="page-title">交付任务详情</h1>
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
            <span class="card-icon">📋</span>
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
              <div class="info-item address-item">
                <div class="info-icon-wrapper address-icon">
                  <span class="info-icon">📍</span>
                </div>
                <div class="info-content">
                  <div class="info-label">配送地址</div>
                  <div class="info-value address-text">{{ task.deliveryAddress }}</div>
                </div>
                <button class="contact-btn map-btn" @click="openMap">
                  <span class="btn-icon">🗺️</span>
                  <span>查看地图</span>
                </button>
              </div>
            </div>
          </div>
        </section>

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
            <div class="photo-upload-area">
              <div
                v-for="(photo, index) in deliveryPhotos"
                :key="index"
                class="photo-item"
              >
                <img :src="photo" alt="交付凭证" class="photo-preview" />
                <button class="photo-delete" @click="removePhoto(index)">
                  <span>×</span>
                </button>
              </div>
              <label v-if="deliveryPhotos.length < 9" class="photo-upload-btn">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  @change="handlePhotoUpload"
                  hidden
                />
                <div class="upload-icon">📸</div>
                <div class="upload-text">上传照片</div>
                <div class="upload-hint">最多9张</div>
              </label>
            </div>
            <div class="photo-tips">
              <p>📌 请拍摄清晰的交付现场照片，包括：</p>
              <ul>
                <li>物品全貌照片</li>
                <li>客户签收场景</li>
                <li>物品细节照片</li>
              </ul>
            </div>
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

        <section v-if="task.status !== 'completed'" class="info-card remark-section">
          <div class="card-header">
            <span class="card-icon">📝</span>
            <h2 class="card-title">交付备注</h2>
            <span class="optional-tag">选填</span>
          </div>
          <div class="card-body">
            <textarea
              v-model="deliveryRemark"
              class="remark-textarea"
              placeholder="请输入交付备注信息，如：物品完好无损、客户满意等..."
              rows="4"
            ></textarea>
          </div>
        </section>

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

    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="modal-content success-modal" @click.stop>
        <div class="success-icon">✅</div>
        <h3 class="success-title">交付成功！</h3>
        <p class="success-message">任务已标记为已交付状态，租赁中任务已自动创建</p>
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
import { getRentalTaskDetail, confirmDelivery } from '../api/rentalTask'

const route = useRoute()
const router = useRouter()

const taskId = computed(() => route.params.id)
const task = ref(null)
const loading = ref(true)
const submitting = ref(false)
const deliveryPhotos = ref([])
const deliveryRemark = ref('')
const showSuccessModal = ref(false)
const showCopyTip = ref(false)

const priorityText = computed(() => {
  if (!task.value) return ''
  const map = { high: '高优先', medium: '中优先', low: '低优先' }
  return map[task.value.priority] || '普通'
})

const canConfirm = computed(() => {
  return deliveryPhotos.value.length > 0 && !submitting.value
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
  router.push('/rental-tasks?type=delivery')
}

const handlePhotoUpload = (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  const remainingSlots = 9 - deliveryPhotos.value.length
  const filesToProcess = Array.from(files).slice(0, remainingSlots)

  filesToProcess.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      deliveryPhotos.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
  })

  event.target.value = ''
}

const removePhoto = (index) => {
  deliveryPhotos.value.splice(index, 1)
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

const openMap = () => {
  if (task.value && task.value.deliveryAddress) {
    window.open(`https://map.baidu.com/search/${encodeURIComponent(task.value.deliveryAddress)}`, '_blank')
  }
}

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

const closeSuccessModal = () => {
  showSuccessModal.value = false
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

.page-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%);
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
  color: #2563eb;
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

.photo-upload-area {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.photo-item {
  position: relative;
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
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.photo-delete:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.photo-upload-btn {
  aspect-ratio: 1;
  border-radius: 8px;
  border: 2px dashed #d1d5db;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 4px;
}

.photo-upload-btn:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-icon {
  font-size: 28px;
}

.upload-text {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.upload-hint {
  font-size: 11px;
  color: #9ca3af;
}

.photo-tips {
  padding: 14px 16px;
  background: #f0fdf4;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
}

.photo-tips p {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 500;
  color: #166534;
}

.photo-tips ul {
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  color: #15803d;
  line-height: 1.8;
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

.remark-textarea {
  width: 100%;
  padding: 12px 14px;
  font-size: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.remark-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.remark-textarea::placeholder {
  color: #9ca3af;
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
  border-radius: 16px;
  padding: 32px 40px;
  text-align: center;
  max-width: 360px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
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

.success-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.success-title {
  font-size: 22px;
  font-weight: 700;
  color: #16a34a;
  margin: 0 0 8px 0;
}

.success-message {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
}

.success-btn {
  width: 100%;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #ffffff;
  transition: all 0.2s ease;
}

.success-btn:hover {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  transform: translateY(-1px);
}

.copy-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 2000;
  animation: toastIn 0.3s ease;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@media (max-width: 640px) {
  .page-header {
    padding: 16px 20px 24px;
  }

  .page-title {
    font-size: 22px;
  }

  .customer-info-grid {
    grid-template-columns: 1fr;
  }

  .contact-item,
  .address-item {
    grid-column: span 1;
  }

  .photo-upload-area,
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
