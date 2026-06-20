<template>
  <div class="rental-task-card">
    <div class="card-header">
      <div class="card-header-left">
        <span class="task-id-badge">
          <span class="task-id-icon">#</span>
          <span class="task-id-text">{{ task.id }}</span>
        </span>
        <span class="task-type-tag" :class="task.type">
          {{ task.typeText }}
        </span>
      </div>
      <div class="card-header-right">
        <span
          class="priority-tag"
          :class="task.priority"
        >
          {{ priorityText }}
        </span>
        <span
          class="status-tag"
          :class="task.status"
        >
          {{ task.statusText }}
        </span>
      </div>
    </div>

    <div class="card-body">
      <h3 class="task-title">{{ task.title }}</h3>
      <p class="task-description">{{ task.description }}</p>

      <div class="info-grid">
        <div class="info-item">
          <div class="info-icon-wrapper user-icon">
            <span class="info-icon">👤</span>
          </div>
          <div class="info-content">
            <div class="info-label">客户信息</div>
            <div class="info-value customer-name">{{ task.customerName }}</div>
            <div class="info-sub-value">
              <span>{{ task.customerContact }}</span>
              <span class="contact-separator">·</span>
              <span class="phone-text">{{ task.customerPhone }}</span>
            </div>
          </div>
        </div>

        <div v-if="displayAddress" class="info-item">
          <div class="info-icon-wrapper address-icon">
            <span class="info-icon">📍</span>
          </div>
          <div class="info-content">
            <div class="info-label">{{ addressLabel }}</div>
            <div class="info-value address-text">{{ displayAddress }}</div>
          </div>
        </div>

        <div class="info-item">
          <div class="info-icon-wrapper time-icon">
            <span class="info-icon">⏰</span>
          </div>
          <div class="info-content">
            <div class="info-label">时间信息</div>
            <div class="info-value">{{ mainTimeLabel }}</div>
            <div class="info-sub-value">创建：{{ task.createTime }}</div>
          </div>
        </div>

        <div class="info-item">
          <div class="info-icon-wrapper item-icon">
            <span class="info-icon">📦</span>
          </div>
          <div class="info-content">
            <div class="info-label">租赁物品</div>
            <div class="info-value">{{ task.itemName }} × {{ task.itemCount }}</div>
            <div class="info-sub-value">负责人：{{ task.assignee }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <div v-if="task.damageFee !== undefined" class="footer-stat damage-fee" :class="{ has: task.damageFee > 0 }">
        <span class="stat-label">损坏赔偿</span>
        <span class="stat-value">¥{{ task.damageFee }}</span>
      </div>
      <div v-if="task.repairCost !== undefined" class="footer-stat repair-cost">
        <span class="stat-label">维修费用</span>
        <span class="stat-value">¥{{ task.repairCost }}</span>
      </div>
      <div v-if="task.monthlyFee !== undefined" class="footer-stat monthly-fee">
        <span class="stat-label">月租金</span>
        <span class="stat-value">¥{{ task.monthlyFee }}/月</span>
      </div>
      <div class="card-actions">
        <button class="action-btn detail-btn">查看详情</button>
        <button class="action-btn primary-btn">处理任务</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const priorityText = computed(() => {
  const map = {
    high: '高优先',
    medium: '中优先',
    low: '低优先'
  }
  return map[props.task.priority] || '普通'
})

const displayAddress = computed(() => {
  return props.task.deliveryAddress || ''
})

const addressLabel = computed(() => {
  if (props.task.type === 'delivery') return '配送地址'
  if (props.task.type === 'repair') return '服务地址'
  if (props.task.type === 'acceptance') return '验收地址'
  return '联系地址'
})

const mainTimeLabel = computed(() => {
  const task = props.task
  if (task.type === 'delivery') {
    return task.actualDeliveryTime
      ? `实际交付：${task.actualDeliveryTime}`
      : `计划交付：${task.scheduledDeliveryTime}`
  }
  if (task.type === 'repair') {
    return task.actualRepairTime
      ? `实际维修：${task.actualRepairTime}`
      : `计划维修：${task.scheduledRepairTime}`
  }
  if (task.type === 'acceptance') {
    return task.actualAcceptanceTime
      ? `实际验收：${task.actualAcceptanceTime}`
      : `计划验收：${task.scheduledAcceptanceTime}`
  }
  if (task.type === 'renting') {
    return `租赁周期：${task.rentalStartDate} ~ ${task.rentalEndDate}`
  }
  return task.createTime
})
</script>

<style scoped>
.rental-task-card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #ebeef5;
}

.rental-task-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
  border-color: #dcdfe6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9fb 0%, #fafbfc 100%);
  border-bottom: 1px solid #f0f2f5;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-id-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 10px;
  background: #303133;
  color: #ffffff;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.3px;
}

.task-id-icon {
  opacity: 0.7;
  font-size: 11px;
}

.task-id-text {
  line-height: 1;
}

.task-type-tag {
  display: inline-block;
  padding: 5px 12px;
  font-size: 12px;
  border-radius: 6px;
  font-weight: 500;
  border: 1px solid transparent;
}

.task-type-tag.delivery {
  background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
  color: #2d8cf0;
  border-color: #a0cfff;
}

.task-type-tag.renting {
  background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
  color: #52c41a;
  border-color: #b7eb8f;
}

.task-type-tag.acceptance {
  background: linear-gradient(135deg, #fdf6ec 0%, #faecd8 100%);
  color: #fa8c16;
  border-color: #ffd591;
}

.task-type-tag.repair {
  background: linear-gradient(135deg, #fff1f0 0%, #ffe4e3 100%);
  color: #f5222d;
  border-color: #ffa39e;
}

.priority-tag {
  display: inline-block;
  padding: 4px 10px;
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

.status-tag {
  display: inline-block;
  padding: 5px 14px;
  font-size: 12px;
  border-radius: 12px;
  font-weight: 500;
  min-width: 68px;
  text-align: center;
}

.status-tag.pending {
  background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%);
  color: #d46b08;
}

.status-tag.processing {
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  color: #096dd9;
}

.status-tag.completed {
  background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
  color: #389e0d;
}

.status-tag.cancelled {
  background: #f5f5f5;
  color: #8c8c8c;
}

.card-body {
  padding: 20px;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.task-description {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 20px 0;
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 6px;
  border-left: 3px solid #e5e7eb;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #f0f1f3;
  transition: all 0.2s ease;
}

.info-item:hover {
  background: #f5f7fa;
  border-color: #e4e7ed;
}

.info-icon-wrapper {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.info-icon-wrapper.user-icon {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
}

.info-icon-wrapper.address-icon {
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
}

.info-icon-wrapper.time-icon {
  background: linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%);
}

.info-icon-wrapper.item-icon {
  background: linear-gradient(135deg, #fffbeb 0%, #fde68a 100%);
}

.info-icon {
  font-size: 18px;
}

.info-content {
  flex: 1;
  min-width: 0;
}

.info-label {
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 4px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  color: #111827;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 2px;
}

.info-value.customer-name {
  font-size: 15px;
  font-weight: 600;
}

.info-sub-value {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
}

.contact-separator {
  margin: 0 6px;
  color: #d1d5db;
}

.phone-text {
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
  color: #374151;
}

.address-text {
  font-size: 13px;
  line-height: 1.5;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: #fafbfc;
  border-top: 1px solid #f0f2f5;
  gap: 12px;
}

.footer-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
}

.footer-stat.damage-fee {
  background: #fef2f2;
  color: #9ca3af;
}

.footer-stat.damage-fee.has {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
}

.footer-stat.repair-cost {
  background: #fffbeb;
  color: #b45309;
}

.footer-stat.monthly-fee {
  background: #eff6ff;
  color: #1d4ed8;
}

.stat-label {
  font-weight: 500;
}

.stat-value {
  font-weight: 600;
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.action-btn {
  padding: 7px 16px;
  font-size: 13px;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  line-height: 1.5;
}

.action-btn.detail-btn {
  background: #ffffff;
  color: #4b5563;
  border-color: #d1d5db;
}

.action-btn.detail-btn:hover {
  color: #2563eb;
  border-color: #93c5fd;
  background: #eff6ff;
}

.action-btn.primary-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
}

.action-btn.primary-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
  transform: translateY(-1px);
}
</style>
