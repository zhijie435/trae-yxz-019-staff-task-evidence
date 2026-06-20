<template>
  <div class="acceptance-detail">
    <header class="page-header">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          <span>返回列表</span>
        </div>
        <div class="header-title">
          <h1 class="page-title">验收任务详情</h1>
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
            </div>
          </div>
        </section>

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
              <div class="file-list">
                <div
                  v-for="(file, index) in acceptanceReport"
                  :key="index"
                  class="file-item"
                >
                  <div class="file-icon">📑</div>
                  <div class="file-info">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-size">{{ formatFileSize(file.size) }}</div>
                  </div>
                  <button class="file-delete" @click="removeReport(index)">
                    <span>×</span>
                  </button>
                </div>
              </div>
              <label v-if="acceptanceReport.length < 5" class="file-upload-btn">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                  multiple
                  @change="handleReportUpload"
                  hidden
                />
                <div class="upload-icon">📤</div>
                <div class="upload-text">上传验收报告</div>
                <div class="upload-hint">支持PDF/Word/Excel/图片，最多5个</div>
              </label>
            </div>
          </section>

          <section class="info-card upload-section">
            <div class="card-header">
              <span class="card-icon">📷</span>
              <h2 class="card-title">设备状态照片</h2>
              <span class="required-tag">* 必填</span>
            </div>
            <div class="card-body">
              <div class="photo-upload-area">
                <div
                  v-for="(photo, index) in deviceStatusPhotos"
                  :key="index"
                  class="photo-item"
                >
                  <img :src="photo" alt="设备状态" class="photo-preview" />
                  <button class="photo-delete" @click="removeDevicePhoto(index)">
                    <span>×</span>
                  </button>
                </div>
                <label v-if="deviceStatusPhotos.length < 9" class="photo-upload-btn">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    @change="handleDevicePhotoUpload"
                    hidden
                  />
                  <div class="upload-icon">📸</div>
                  <div class="upload-text">上传照片</div>
                  <div class="upload-hint">最多9张</div>
                </label>
              </div>
              <div class="photo-tips">
                <p>📌 请拍摄清晰的设备状态照片，包括：</p>
                <ul>
                  <li>设备整体外观照片</li>
                  <li>关键部件细节特写</li>
                  <li>屏幕/接口等易损部位</li>
                </ul>
              </div>
            </div>
          </section>

          <section class="info-card upload-section">
            <div class="card-header">
              <span class="card-icon">📋</span>
              <h2 class="card-title">定损单</h2>
              <span class="optional-tag">选填（如有损坏）</span>
            </div>
            <div class="card-body">
              <div class="file-list">
                <div
                  v-for="(file, index) in damageAssessment"
                  :key="index"
                  class="file-item"
                >
                  <div class="file-icon">📝</div>
                  <div class="file-info">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-size">{{ formatFileSize(file.size) }}</div>
                  </div>
                  <button class="file-delete" @click="removeDamageAssessment(index)">
                    <span>×</span>
                  </button>
                </div>
              </div>
              <label v-if="damageAssessment.length < 3" class="file-upload-btn">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  multiple
                  @change="handleDamageAssessmentUpload"
                  hidden
                />
                <div class="upload-icon">📤</div>
                <div class="upload-text">上传定损单</div>
                <div class="upload-hint">支持PDF/Word/图片，最多3个</div>
              </label>

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

          <section class="info-card result-section">
            <div class="card-header">
              <span class="card-icon">✅</span>
              <h2 class="card-title">验收结果</h2>
              <span class="required-tag">* 必填</span>
            </div>
            <div class="card-body">
              <div class="result-options">
                <label
                  class="result-option"
                  :class="{ active: acceptanceResult === 'good' }"
                >
                  <input
                    type="radio"
                    v-model="acceptanceResult"
                    value="good"
                    hidden
                  />
                  <div class="option-icon good-icon">🟢</div>
                  <div class="option-content">
                    <div class="option-title">设备完好</div>
                    <div class="option-desc">无损坏，正常回收</div>
                  </div>
                  <div class="option-check" v-if="acceptanceResult === 'good'">✓</div>
                </label>

                <label
                  class="result-option"
                  :class="{ active: acceptanceResult === 'damaged' }"
                >
                  <input
                    type="radio"
                    v-model="acceptanceResult"
                    value="damaged"
                    hidden
                  />
                  <div class="option-icon damaged-icon">🟡</div>
                  <div class="option-content">
                    <div class="option-title">轻微损坏</div>
                    <div class="option-desc">有轻微划痕或小故障</div>
                  </div>
                  <div class="option-check" v-if="acceptanceResult === 'damaged'">✓</div>
                </label>

                <label
                  class="result-option"
                  :class="{ active: acceptanceResult === 'serious' }"
                >
                  <input
                    type="radio"
                    v-model="acceptanceResult"
                    value="serious"
                    hidden
                  />
                  <div class="option-icon serious-icon">🔴</div>
                  <div class="option-content">
                    <div class="option-title">严重损坏</div>
                    <div class="option-desc">功能故障或物理损坏严重</div>
                  </div>
                  <div class="option-check" v-if="acceptanceResult === 'serious'">✓</div>
                </label>
              </div>
            </div>
          </section>

          <section class="info-card remark-section">
            <div class="card-header">
              <span class="card-icon">📝</span>
              <h2 class="card-title">验收备注</h2>
              <span class="optional-tag">选填</span>
            </div>
            <div class="card-body">
              <textarea
                v-model="acceptanceRemark"
                class="remark-textarea"
                placeholder="请输入验收备注信息，如：设备使用情况、损坏细节说明等..."
                rows="4"
              ></textarea>
            </div>
          </section>
        </template>

        <template v-else>
          <section v-if="task.acceptanceReport && task.acceptanceReport.length > 0" class="info-card files-section">
            <div class="card-header">
              <span class="card-icon">📄</span>
              <h2 class="card-title">验收报告</h2>
            </div>
            <div class="card-body">
              <div class="file-list">
                <div
                  v-for="(file, index) in task.acceptanceReport"
                  :key="index"
                  class="file-item completed"
                >
                  <div class="file-icon">📑</div>
                  <div class="file-info">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-size">{{ formatFileSize(file.size) }}</div>
                  </div>
                </div>
              </div>
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
              <div class="file-list">
                <div
                  v-for="(file, index) in task.damageAssessment"
                  :key="index"
                  class="file-item completed"
                >
                  <div class="file-icon">📝</div>
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

    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="modal-content success-modal" @click.stop>
        <div class="success-icon">✅</div>
        <h3 class="success-title">验收成功！</h3>
        <p class="success-message">任务已标记为验收通过状态，押金退还任务已自动创建</p>
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
import { getRentalTaskDetail, confirmAcceptance } from '../api/rentalTask'

const route = useRoute()
const router = useRouter()

const taskId = computed(() => route.params.id)
const task = ref(null)
const loading = ref(true)
const submitting = ref(false)
const acceptanceReport = ref([])
const deviceStatusPhotos = ref([])
const damageAssessment = ref([])
const acceptanceResult = ref('')
const damageFee = ref(null)
const acceptanceRemark = ref('')
const showSuccessModal = ref(false)
const showCopyTip = ref(false)

const resultTextMap = {
  good: '设备完好，无损坏',
  damaged: '设备有轻微损坏',
  serious: '设备严重损坏'
}

const priorityText = computed(() => {
  if (!task.value) return ''
  const map = { high: '高优先', medium: '中优先', low: '低优先' }
  return map[task.value.priority] || '普通'
})

const canConfirm = computed(() => {
  return (
    acceptanceReport.value.length > 0 &&
    deviceStatusPhotos.value.length > 0 &&
    acceptanceResult.value !== '' &&
    !submitting.value
  )
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
  router.push('/rental-tasks?type=acceptance')
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

const handleReportUpload = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  const remainingSlots = 5 - acceptanceReport.value.length
  const filesToProcess = Array.from(files).slice(0, remainingSlots)

  for (const file of filesToProcess) {
    const fileData = await readFileAsDataURL(file)
    acceptanceReport.value.push(fileData)
  }

  event.target.value = ''
}

const removeReport = (index) => {
  acceptanceReport.value.splice(index, 1)
}

const handleDevicePhotoUpload = (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  const remainingSlots = 9 - deviceStatusPhotos.value.length
  const filesToProcess = Array.from(files).slice(0, remainingSlots)

  filesToProcess.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      deviceStatusPhotos.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
  })

  event.target.value = ''
}

const removeDevicePhoto = (index) => {
  deviceStatusPhotos.value.splice(index, 1)
}

const handleDamageAssessmentUpload = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  const remainingSlots = 3 - damageAssessment.value.length
  const filesToProcess = Array.from(files).slice(0, remainingSlots)

  for (const file of filesToProcess) {
    const fileData = await readFileAsDataURL(file)
    damageAssessment.value.push(fileData)
  }

  event.target.value = ''
}

const removeDamageAssessment = (index) => {
  damageAssessment.value.splice(index, 1)
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

const closeSuccessModal = () => {
  showSuccessModal.value = false
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

.page-header {
  background: linear-gradient(135deg, #92400e 0%, #d97706 60%, #f59e0b 100%);
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
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
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
  border: 2px dashed #fed7aa;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fffbeb;
}

.file-upload-btn:hover {
  border-color: #f59e0b;
  background: #fff7ed;
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  color: #92400e;
  font-weight: 500;
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 12px;
  color: #b45309;
  opacity: 0.8;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
  border: none;
  background: rgba(239, 68, 68, 0.9);
  color: #ffffff;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.photo-delete:hover {
  background: rgba(220, 38, 38, 1);
  transform: scale(1.1);
}

.photo-upload-btn {
  aspect-ratio: 1;
  border: 2px dashed #fcd34d;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fffbeb;
  gap: 4px;
}

.photo-upload-btn:hover {
  border-color: #f59e0b;
  background: #fff7ed;
}

.photo-upload-btn .upload-icon {
  font-size: 24px;
  margin-bottom: 0;
}

.photo-upload-btn .upload-text {
  font-size: 12px;
  margin-bottom: 0;
}

.photo-upload-btn .upload-hint {
  font-size: 10px;
}

.photo-tips {
  padding: 12px 14px;
  background: #fffbeb;
  border-radius: 8px;
  border-left: 3px solid #f59e0b;
}

.photo-tips p {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: #92400e;
  font-weight: 500;
}

.photo-tips ul {
  margin: 0;
  padding-left: 20px;
}

.photo-tips li {
  font-size: 12px;
  color: #b45309;
  line-height: 1.6;
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
  background: #ffffff;
  position: relative;
}

.result-option:hover {
  border-color: #fcd34d;
  background: #fffbeb;
}

.result-option.active {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);
}

.option-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.option-content {
  flex: 1;
  min-width: 0;
}

.option-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
}

.option-desc {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.option-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #f59e0b;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
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
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.remark-textarea::placeholder {
  color: #9ca3af;
}

.photos-section .photos-grid {
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
  background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.success-btn:hover {
  background: linear-gradient(135deg, #b45309 0%, #d97706 100%);
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

  .photo-upload-area {
    grid-template-columns: repeat(4, 1fr);
  }

  .photos-section .photos-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .result-options {
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

@media (max-width: 480px) {
  .photo-upload-area {
    grid-template-columns: repeat(3, 1fr);
  }

  .photos-section .photos-grid {
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
