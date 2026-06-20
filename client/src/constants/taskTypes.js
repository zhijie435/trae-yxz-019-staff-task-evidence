export const TASK_TYPES = {
  delivery: {
    type: 'delivery',
    typeText: '交付任务',
    icon: '🚚',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)',
    routePath: '/rental-tasks/delivery',
    detailRoute: 'DeliveryTaskDetail',
    statusMap: {
      pending: { status: 'pending', statusText: '待交付' },
      processing: { status: 'processing', statusText: '配送中' },
      completed: { status: 'completed', statusText: '已交付' }
    }
  },
  renting: {
    type: 'renting',
    typeText: '租赁中任务',
    icon: '📦',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #166534 0%, #22c55e 60%, #4ade80 100%)',
    routePath: '/rental-tasks/renting',
    detailRoute: 'RentalTaskDetail',
    statusMap: {
      pending: { status: 'pending', statusText: '待跟进' },
      processing: { status: 'processing', statusText: '租赁中' },
      completed: { status: 'completed', statusText: '已完成' }
    }
  },
  acceptance: {
    type: 'acceptance',
    typeText: '验收任务',
    icon: '✅',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #92400e 0%, #d97706 60%, #f59e0b 100%)',
    routePath: '/rental-tasks/acceptance',
    detailRoute: 'AcceptanceTaskDetail',
    statusMap: {
      pending: { status: 'pending', statusText: '待验收' },
      processing: { status: 'processing', statusText: '验收中' },
      completed: { status: 'completed', statusText: '验收通过' }
    }
  },
  repair: {
    type: 'repair',
    typeText: '报修任务',
    icon: '🔧',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 60%, #f97316 100%)',
    routePath: '/rental-tasks/repair',
    detailRoute: 'RepairTaskDetail',
    statusMap: {
      pending: { status: 'pending', statusText: '待处理' },
      processing: { status: 'processing', statusText: '维修中' },
      completed: { status: 'completed', statusText: '已完成' }
    }
  },
  depositRefund: {
    type: 'depositRefund',
    typeText: '押金退还任务',
    icon: '💰',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #065f46 0%, #059669 60%, #10b981 100%)',
    routePath: '/rental-tasks/deposit-refund',
    detailRoute: 'DepositRefundTaskDetail',
    statusMap: {
      pending: { status: 'pending', statusText: '待退还' },
      processing: { status: 'processing', statusText: '处理中' },
      completed: { status: 'completed', statusText: '已退还' }
    }
  }
}

export const TASK_PRIORITIES = {
  high: { priority: 'high', text: '高优先', color: '#f5222d' },
  medium: { priority: 'medium', text: '中优先', color: '#fa8c16' },
  low: { priority: 'low', text: '低优先', color: '#595959' }
}

export const TASK_STATUS = {
  pending: { status: 'pending', text: '待处理', color: '#d46b08' },
  processing: { status: 'processing', text: '处理中', color: '#096dd9' },
  completed: { status: 'completed', text: '已完成', color: '#389e0d' },
  cancelled: { status: 'cancelled', text: '已取消', color: '#8c8c8c' }
}

export const getTaskTypeConfig = (type) => {
  return TASK_TYPES[type] || null
}

export const getTaskTypeText = (type) => {
  return TASK_TYPES[type]?.typeText || type
}

export const getTaskStatusText = (type, status) => {
  return TASK_TYPES[type]?.statusMap?.[status]?.statusText || TASK_STATUS[status]?.text || status
}

export const getTaskPriorityText = (priority) => {
  return TASK_PRIORITIES[priority]?.text || '普通'
}
