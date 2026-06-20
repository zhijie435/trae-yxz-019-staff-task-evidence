<template>
  <div class="task-detail">
    <header class="page-header">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          <span>返回列表</span>
        </div>
        <div class="header-title">
          <h1 class="page-title">任务详情</h1>
          <p class="page-subtitle">
            任务编号：<span class="task-id">#{{ taskId }}</span>
            <span class="task-type-tag" :class="task?.type">{{ task?.typeText }}</span>
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
        <section class="info-card status-timeline-card">
          <div class="card-header">
            <span class="card-icon">📊</span>
            <h2 class="card-title">状态跟踪</h2>
            <span class="status-badge" :class="task.status">
              {{ task.statusText }}
            </span>
          </div>
          <div class="card-body">
            <div class="status-timeline">
              <div
                v-for="(step, index) in statusSteps"
                :key="index"
                class="timeline-step"
                :class="{ active: step.active, current: step.current, done: step.done }"
              >
                <div class="step-indicator">
                  <div class="step-circle">
                    <span v-if="step.done" class="step-check">✓</span>
                    <span v-else>{{ index + 1 }}</span>
                  </div>
                  <div v-if="index < statusSteps.length - 1" class="step-line"></div>
                </div>
                <div class="step-content">
                  <div class="step-title">{{ step.title }}</div>
                  <div class="step-time">{{ step.time || '-' }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="info-card order-section">
          <div class="card-header">
            <span class="card-icon">📦</span>
            <h2 class="card-title">订单信息</h2>
          </div>
          <div class="card-body">
            <h3 class="order-title">{{ task.title }}</h3>
            <p class="order-desc">{{ task.description }}</p>

            <div class="info-block">
              <div class="block-title">
                <span class="block-icon">📌</span>
                <span>基本信息</span>
              </div>
              <div class="info-rows">
                <div class="info-row">
                  <span class="info-label">任务类型</span>
                  <span class="info-value">{{ task.typeText }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">优先级</span>
                  <span class="priority-tag" :class="task.priority">
                    {{ priorityText }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">创建时间</span>
                  <span class="info-value">{{ task.createTime }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">负责人</span>
                  <span class="info-value">{{ task.assignee }}</span>
                </div>
              </div>
            </div>

            <div class="info-block">
              <div class="block-title">
                <span class="block-icon">🛠️</span>
                <span>租赁物品</span>
              </div>
              <div class="info-rows">
                <div class="info-row">
                  <span class="info-label">物品名称</span>
                  <span class="info-value">{{ task.itemName }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">数量</span>
                  <span class="info-value">× {{ task.itemCount }} 件</span>
                </div>
                <div class="info-row" v-if="task.monthlyRent">
                  <span class="info-label">月租金</span>
                  <span class="info-value price">¥{{ task.monthlyRent }}/月</span>
                </div>
                <div class="info-row" v-if="task.damageDeposit">
                  <span class="info-label">损坏赔偿</span>
                  <span class="info-value">¥{{ task.damageDeposit }}</span>
                </div>
                <div class="info-row" v-if="task.repairCost">
                  <span class="info-label">维修费用</span>
                  <span class="info-value price">¥{{ task.repairCost }}</span>
                </div>
              </div>
            </div>

            <div class="info-block" v-if="hasTimeInfo">
              <div class="block-title">
                <span class="block-icon">📅</span>
                <span>时间信息</span>
              </div>
              <div class="info-rows">
                <div class="info-row" v-if="task.rentalStartDate">
                  <span class="info-label">租赁开始</span>
                  <span class="info-value">{{ task.rentalStartDate }}</span>
                </div>
                <div class="info-row" v-if="task.rentalEndDate">
                  <span class="info-label">租赁结束</span>
                  <span class="info-value">{{ task.rentalEndDate }}</span>
                </div>
                <div class="info-row" v-if="task.scheduledDeliveryTime">
                  <span class="info-label">计划交付</span>
                  <span class="info-value">{{ task.scheduledDeliveryTime }}</span>
                </div>
                <div class="info-row" v-if="task.actualDeliveryTime">
                  <span class="info-label">实际交付</span>
                  <span class="info-value success">{{ task.actualDeliveryTime }}</span>
                </div>
                <div class="info-row" v-if="task.scheduledAcceptanceTime">
                  <span class="info-label">计划验收</span>
                  <span class="info-value">{{ task.scheduledAcceptanceTime }}</span>
                </div>
                <div class="info-row" v-if="task.actualAcceptanceTime">
                  <span class="info-label">实际验收</span>
                  <span class="info-value success">{{ task.actualAcceptanceTime }}</span>
                </div>
                <div class="info-row" v-if="task.lastInspectionTime">
                  <span class="info-label">上次巡检</span>
                  <span class="info-value">{{ task.lastInspectionTime }}</span>
                </div>
                <div class="info-row" v-if="task.nextInspectionTime">
                  <span class="info-label">下次巡检</span>
                  <span class="info-value warning">{{ task.nextInspectionTime }}</span>
                </div>
                <div class="info-row" v-if="task.scheduledRepairTime">
                  <span class="info-label">预约维修</span>
                  <span class="info-value">{{ task.scheduledRepairTime }}</span>
                </div>
                <div class="info-row" v-if="task.actualRepairTime">
                  <span class="info-label">完成维修</span>
                  <span class="info-value success">{{ task.actualRepairTime }}</span>
                </div>
              </div>
            </div>

            <div class="info-block" v-if="hasProcessInfo">
              <div class="block-title">
                <span class="block-icon">📝</span>
                <span>处理信息</span>
              </div>
              <div class="info-rows">
                <div class="info-row" v-if="task.faultDescription">
                  <span class="info-label">故障描述</span>
                  <span class="info-value desc">{{ task.faultDescription }}</span>
                </div>
                <div class="info-row" v-if="task.acceptanceResult">
                  <span class="info-label">验收结果</span>
                  <span class="info-value">{{ task.acceptanceResult }}</span>
                </div>
                <div class="info-row" v-if="task.damageFee > 0">
                  <span class="info-label">损坏赔偿</span>
                  <span class="info-value danger">¥{{ task.damageFee }}</span>
                </div>
                <div class="info-row" v-if="task.repairResult">
                  <span class="info-label">维修结果</span>
                  <span class="info-value">{{ task.repairResult }}</span>
                </div>
                <div class="info-row" v-if="task.deliveryRemark">
                  <span class="info-label">交付备注</span>
                  <span class="info-value desc">{{ task.deliveryRemark }}</span>
                </div>
                <div class="info-row" v-if="task.acceptanceRemark">
                  <span class="info-label">验收备注</span>
                  <span class="info-value desc">{{ task.acceptanceRemark }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="info-card customer-section">
          <div class="card-header">
            <span class="card-icon">👤</span>
            <h2 class="card-title">客户信息</h2>
          </div>
          <div class="card-body">
            <div class="customer-header">
              <div class="customer-avatar">
                {{ task.customerName?.charAt(0) || '客' }}
              </div>
              <div class="customer-main">
                <div class="customer-name">{{ task.customerName }}</div>
                <div class="customer-contact">
                  <span class="contact-label">联系人：</span>
                  <span class="contact-value">{{ task.customerContact }}</span>
                </div>
              </div>
            </div>

            <div class="customer-actions">
              <a :href="'tel:' + task.customerPhone" class="customer-action call-action">
                <span class="action-icon">📞</span>
                <span class="action-text">一键拨号</span>
              </a>
              <button class="customer-action copy-action" @click="copyPhone">
                <span class="action-icon">📋</span>
                <span class="action-text">复制号码</span>
              </button>
            </div>

            <div class="address-block" v-if="displayAddress">
              <div class="address-header">
                <span class="address-icon">📍</span>
                <span class="address-label">{{ addressLabel }}</span>
              </div>
              <div class="address-content">{{ displayAddress }}</div>
              <button class="nav-btn" @click="openMap">
                <span class="nav-icon">🧭</span>
                <span>一键导航</span>
              </button>
            </div>
          </div>
        </section>

        <section class="info-card logs-section">
          <div class="card-header">
            <span class="card-icon">📝</span>
            <h2 class="card-title">操作日志</h2>
            <span class="log-count">{{ operationLogs.length }} 条记录</span>
          </div>
          <div class="card-body">
            <div v-if="logsLoading" class="logs-loading">
              <div class="mini-spinner"></div>
              <span>加载日志中...</span>
            </div>
            <div v-else class="logs-timeline">
              <div
                v-for="(log, index) in operationLogs"
                :key="index"
                class="log-item"
                :class="log.type"
              >
                <div class="log-dot">
                  <span class="dot-icon">{{ logIconMap[log.type] || '📌' }}</span>
                </div>
                <div class="log-content">
                  <div class="log-header">
                    <span class="log-title">{{ log.title }}</span>
                    <span class="log-time">{{ log.time }}</span>
                  </div>
                  <p class="log-desc">{{ log.description }}</p>
                  <div class="log-operator">操作人：{{ log.operator }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <div v-if="showCopyTip" class="copy-toast">
      号码已复制到剪贴板
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRentalTaskDetail, getTaskOperationLogs } from '../api/rentalTask'

const route = useRoute()
const router = useRouter()

const taskId = computed(() => route.params.id)
const task = ref(null)
const loading = ref(true)
const logsLoading = ref(false)
const operationLogs = ref([])
const showCopyTip = ref(false)

const logIconMap = {
  create: '🆕',
  process: '⚙️',
  complete: '✅',
  inspect: '🔍',
  repair: '🔧',
  delivery: '📦',
  acceptance: '📋'
}

const priorityText = computed(() => {
  if (!task.value) return ''
  const map = { high: '高优先', medium: '中优先', low: '低优先' }
  return map[task.value.priority] || '普通'
})

const statusSteps = computed(() => {
  if (!task.value) return []

  const steps = [
    { title: '任务创建', time: task.value.createTime, done: true, active: true, current: false }
  ]

  if (task.value.status === 'pending') {
    steps.push({ title: '开始处理', time: '', done: false, active: false, current: true })
    steps.push({ title: getStep3Title(), time: '', done: false, active: false, current: false })
  } else if (task.value.status === 'processing') {
    steps.push({ title: '开始处理', time: task.value.processTime || '', done: true, active: true, current: false })
    steps.push({ title: getStep3Title(), time: '', done: false, active: false, current: true })
  } else if (task.value.status === 'completed') {
    steps.push({ title: '开始处理', time: task.value.processTime || '', done: true, active: true, current: false })
    steps.push({ title: getStep3Title(), time: task.value.completeTime || '', done: true, active: true, current: false })
  }

  return steps
})

const getStep3Title = () => {
  if (!task.value) return '任务完成'
  const typeMap = {
    delivery: '交付完成',
    acceptance: '验收完成',
    repair: '维修完成',
    renting: '租赁跟进',
    inspect: '巡检完成'
  }
  return typeMap[task.value.type] || '任务完成'
}

const hasTimeInfo = computed(() => {
  if (!task.value) return false
  const t = task.value
  return !!(t.rentalStartDate || t.rentalEndDate || t.scheduledDeliveryTime ||
    t.actualDeliveryTime || t.scheduledAcceptanceTime || t.actualAcceptanceTime ||
    t.lastInspectionTime || t.nextInspectionTime || t.scheduledRepairTime || t.actualRepairTime)
})

const hasProcessInfo = computed(() => {
  if (!task.value) return false
  const t = task.value
  return !!(t.faultDescription || t.acceptanceResult || t.damageFee > 0 ||
    t.repairResult || t.deliveryRemark || t.acceptanceRemark)
})

const displayAddress = computed(() => {
  if (!task.value) return ''
  return task.value.deliveryAddress || task.value.serviceAddress || task.value.address || ''
})

const addressLabel = computed(() => {
  if (!task.value) return '联系地址'
  if (task.value.type === 'delivery') return '配送地址'
  if (task.value.type === 'repair') return '服务地址'
  if (task.value.type === 'acceptance') return '验收地址'
  return '联系地址'
})

const fetchTaskDetail = async () => {
  loading.value = true
  try {
    const res = await getRentalTaskDetail(taskId.value)
    if (res.code === 0) {
      task.value = res.data
      fetchOperationLogs()
    }
  } catch (error) {
    console.error('获取任务详情失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchOperationLogs = async () => {
  logsLoading.value = true
  try {
    const res = await getTaskOperationLogs(taskId.value)
    if (res.code === 0) {
      operationLogs.value = res.data || []
    }
  } catch (error) {
    console.error('获取操作日志失败:', error)
  } finally {
    logsLoading.value = false
  }
}

const goBack = () => {
  if (task.value?.type) {
    router.push(`/rental-tasks?type=${task.value.type}`)
  } else {
    router.push('/rental-tasks')
  }
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
  if (displayAddress.value) {
    window.open(`https://map.baidu.com/search/${encodeURIComponent(displayAddress.value)}`, '_blank')
  }
}

onMounted(() => {
  fetchTaskDetail()
})
</script>

<style scoped>
.task-detail {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 40px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.task-id {
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
  font-weight: 600;
}

.task-type-tag {
  padding: 2px 10px;
  font-size: 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  font-weight: 500;
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

.card-body {
  padding: 20px;
}

.status-timeline-card .card-body {
  padding: 30px 20px;
}

.status-timeline {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
}

.timeline-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  z-index: 1;
}

.step-indicator {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: center;
  position: relative;
}

.step-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  background: #e5e7eb;
  color: #9ca3af;
  transition: all 0.3s ease;
  z-index: 2;
}

.timeline-step.done .step-circle {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
}

.timeline-step.current .step-circle {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
}

.step-check {
  font-size: 22px;
  font-weight: 700;
}

.step-line {
  position: absolute;
  top: 23px;
  left: 50%;
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  z-index: 1;
  transition: background 0.3s ease;
}

.timeline-step.done .step-line {
  background: linear-gradient(90deg, #22c55e, #22c55e);
}

.step-content {
  margin-top: 12px;
}

.step-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.timeline-step.done .step-title {
  color: #16a34a;
}

.timeline-step.current .step-title {
  color: #2563eb;
}

.step-time {
  font-size: 12px;
  color: #9ca3af;
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
}

.order-section .order-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.order-section .order-desc {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 20px 0;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  border-left: 3px solid #e5e7eb;
}

.info-block {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}

.info-block:last-child {
  margin-bottom: 0;
}

.block-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.block-icon {
  font-size: 16px;
}

.info-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  font-size: 13px;
}

.info-label {
  color: #9ca3af;
  flex-shrink: 0;
}

.info-value {
  color: #111827;
  font-weight: 500;
  text-align: right;
  word-break: break-all;
}

.info-value.price {
  color: #dc2626;
  font-weight: 600;
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
}

.info-value.success {
  color: #16a34a;
}

.info-value.warning {
  color: #d97706;
}

.info-value.danger {
  color: #dc2626;
  font-weight: 600;
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
}

.info-value.desc {
  font-size: 12px;
  line-height: 1.5;
  color: #4b5563;
  font-weight: normal;
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

.customer-section .customer-header {
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

.customer-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.customer-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.call-action {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #ffffff;
  border-color: #16a34a;
}

.call-action:hover {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.copy-action {
  background: #ffffff;
  color: #4b5563;
  border-color: #d1d5db;
}

.copy-action:hover {
  color: #3b82f6;
  border-color: #93c5fd;
  background: #eff6ff;
}

.action-icon {
  font-size: 18px;
}

.address-block {
  padding: 14px 16px;
  background: #eff6ff;
  border-radius: 8px;
  border: 1px solid #bfdbfe;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.address-icon {
  font-size: 16px;
}

.address-label {
  font-size: 13px;
  color: #1e40af;
  font-weight: 500;
}

.address-content {
  font-size: 14px;
  color: #1e3a8a;
  line-height: 1.5;
  margin-bottom: 12px;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px 16px;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.nav-icon {
  font-size: 16px;
}

.logs-section .log-count {
  font-size: 12px;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 10px;
  border-radius: 10px;
}

.logs-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 20px;
  color: #9ca3af;
  font-size: 13px;
}

.mini-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.logs-timeline {
  position: relative;
  padding-left: 20px;
}

.log-item {
  position: relative;
  padding-bottom: 24px;
  padding-left: 24px;
  border-left: 2px solid #e5e7eb;
}

.log-item:last-child {
  padding-bottom: 0;
  border-left-color: transparent;
}

.log-dot {
  position: absolute;
  left: -11px;
  top: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dot-icon {
  font-size: 12px;
}

.log-item.create .log-dot {
  border-color: #93c5fd;
  background: #eff6ff;
}

.log-item.process .log-dot {
  border-color: #fcd34d;
  background: #fffbeb;
}

.log-item.complete .log-dot {
  border-color: #86efac;
  background: #f0fdf4;
}

.log-item.inspect .log-dot {
  border-color: #c4b5fd;
  background: #f5f3ff;
}

.log-item.repair .log-dot {
  border-color: #fdba74;
  background: #fff7ed;
}

.log-item.delivery .log-dot {
  border-color: #67e8f9;
  background: #ecfeff;
}

.log-item.acceptance .log-dot {
  border-color: #fca5a5;
  background: #fef2f2;
}

.log-content {
  background: #fafbfc;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #f0f1f3;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.log-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.log-time {
  font-size: 12px;
  color: #9ca3af;
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
  flex-shrink: 0;
}

.log-desc {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 6px 0;
}

.log-operator {
  font-size: 12px;
  color: #9ca3af;
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

  .status-timeline {
    flex-direction: column;
    gap: 0;
  }

  .timeline-step {
    flex-direction: row;
    align-items: flex-start;
    text-align: left;
    padding-left: 0;
    padding-bottom: 24px;
    position: relative;
  }

  .step-indicator {
    width: auto;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    margin-right: 16px;
  }

  .step-line {
    position: absolute;
    top: 48px;
    left: 22px;
    width: 4px;
    height: calc(100% + 24px);
  }

  .step-content {
    margin-top: 8px;
    flex: 1;
  }

  .customer-actions {
    flex-direction: column;
  }

  .info-row {
    flex-direction: column;
    gap: 4px;
  }

  .info-value {
    text-align: left;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 22px;
  }

  .card-body {
    padding: 16px;
  }

  .info-block {
    padding: 12px;
  }
}
</style>
