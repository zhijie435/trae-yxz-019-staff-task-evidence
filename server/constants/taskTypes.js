const TASK_TYPES = {
  delivery: {
    type: 'delivery',
    typeText: '交付任务',
    statusMap: {
      pending: { status: 'pending', statusText: '待交付' },
      processing: { status: 'processing', statusText: '配送中' },
      completed: { status: 'completed', statusText: '已交付' }
    },
    completedStatus: 'completed',
    completedStatusText: '已交付',
    actualTimeField: 'actualDeliveryTime',
    idPrefix: 1000,
    nextTaskType: 'renting',
    assignee: '李送货'
  },
  renting: {
    type: 'renting',
    typeText: '租赁中任务',
    statusMap: {
      pending: { status: 'pending', statusText: '待跟进' },
      processing: { status: 'processing', statusText: '租赁中' },
      completed: { status: 'completed', statusText: '已结束' }
    },
    completedStatus: 'completed',
    completedStatusText: '已结束',
    actualTimeField: 'actualCheckTime',
    idPrefix: 2000,
    nextTaskType: 'acceptance',
    assignee: '赵运维'
  },
  acceptance: {
    type: 'acceptance',
    typeText: '验收任务',
    statusMap: {
      pending: { status: 'pending', statusText: '待验收' },
      processing: { status: 'processing', statusText: '验收中' },
      completed: { status: 'completed', statusText: '验收通过' }
    },
    completedStatus: 'completed',
    completedStatusText: '验收通过',
    actualTimeField: 'actualAcceptanceTime',
    idPrefix: 3000,
    nextTaskType: 'depositRefund',
    assignee: '郑验收'
  },
  repair: {
    type: 'repair',
    typeText: '报修任务',
    statusMap: {
      pending: { status: 'pending', statusText: '待处理' },
      processing: { status: 'processing', statusText: '维修中' },
      completed: { status: 'completed', statusText: '已完成' }
    },
    completedStatus: 'completed',
    completedStatusText: '已完成',
    actualTimeField: 'actualRepairTime',
    idPrefix: 4000,
    nextTaskType: null,
    assignee: '黄维修'
  },
  depositRefund: {
    type: 'depositRefund',
    typeText: '押金退还任务',
    statusMap: {
      pending: { status: 'pending', statusText: '待退还' },
      processing: { status: 'processing', statusText: '退还中' },
      completed: { status: 'completed', statusText: '已退还' }
    },
    completedStatus: 'completed',
    completedStatusText: '已退还',
    actualTimeField: 'actualRefundTime',
    idPrefix: 5000,
    nextTaskType: null,
    assignee: '钱财务'
  }
}

const TASK_PRIORITIES = {
  high: { priority: 'high', priorityText: '高' },
  medium: { priority: 'medium', priorityText: '中' },
  low: { priority: 'low', priorityText: '低' }
}

const OPERATION_LOG_TYPES = {
  delivery: { type: 'delivery', title: '交付完成', desc: '物品已成功交付给客户' },
  acceptance: { type: 'acceptance', title: '验收完成', descField: 'acceptanceResult', defaultDesc: '设备验收通过' },
  repair: { type: 'repair', title: '维修完成', descField: 'repairResult', defaultDesc: '设备已维修完成' },
  renting: { type: 'inspect', title: '巡检完成', desc: '设备巡检完成，状态正常' },
  depositRefund: { type: 'refund', title: '押金已退还', descTemplate: '押金已退还，实际退还金额¥{amount}' }
}

function getTaskTypeConfig(type) {
  return TASK_TYPES[type] || null
}

function getTaskTypeText(type) {
  const config = getTaskTypeConfig(type)
  return config ? config.typeText : '未知类型'
}

function getTaskStatusConfig(type, status) {
  const typeConfig = getTaskTypeConfig(type)
  if (!typeConfig) return null
  return typeConfig.statusMap[status] || null
}

function getTaskStatusText(type, status) {
  const statusConfig = getTaskStatusConfig(type, status)
  return statusConfig ? statusConfig.statusText : '未知状态'
}

function getTaskPriorityText(priority) {
  const config = TASK_PRIORITIES[priority]
  return config ? config.priorityText : '未知优先级'
}

function getOperationLogConfig(type) {
  return OPERATION_LOG_TYPES[type] || null
}

module.exports = {
  TASK_TYPES,
  TASK_PRIORITIES,
  OPERATION_LOG_TYPES,
  getTaskTypeConfig,
  getTaskTypeText,
  getTaskStatusConfig,
  getTaskStatusText,
  getTaskPriorityText,
  getOperationLogConfig
}
