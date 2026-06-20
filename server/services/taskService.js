const {
  getTaskTypeConfig,
  getTaskTypeText,
  getOperationLogConfig
} = require('../constants/taskTypes')
const {
  formatDateTime,
  formatDate,
  formatDateCompact,
  addDays,
  generateTaskId
} = require('../utils/helpers')

function updateTaskStatus(task, taskType, updateData) {
  const typeConfig = getTaskTypeConfig(taskType)
  if (!typeConfig) return null

  task.status = typeConfig.completedStatus
  task.statusText = typeConfig.completedStatusText

  const timeField = typeConfig.actualTimeField
  task[timeField] = updateData[timeField] || formatDateTime()

  Object.keys(updateData).forEach(key => {
    if (key !== timeField && updateData[key] !== undefined) {
      task[key] = updateData[key]
    }
  })

  return task
}

function createNextTask(task, currentType, tasks) {
  const currentConfig = getTaskTypeConfig(currentType)
  if (!currentConfig || !currentConfig.nextTaskType) return null

  const nextType = currentConfig.nextTaskType
  const nextConfig = getTaskTypeConfig(nextType)
  if (!nextConfig) return null

  const now = new Date()
  const nowStr = formatDateTime(now)
  const dateStr = formatDateCompact(now)

  const newTaskId = generateTaskId(tasks, nextConfig.idPrefix)

  const baseTask = {
    id: newTaskId,
    type: nextType,
    typeText: nextConfig.typeText,
    itemName: task.itemName,
    itemCount: task.itemCount,
    customerName: task.customerName,
    customerContact: task.customerContact,
    customerPhone: task.customerPhone,
    priority: task.priority,
    priorityText: task.priorityText,
    createTime: nowStr,
    assignee: nextConfig.assignee
  }

  let specificData = {}

  switch (nextType) {
    case 'renting': {
      const rentalStartDate = formatDate(now)
      const rentalEndDate = formatDate(addDays(now, 90))
      const nextCheckTime = formatDate(addDays(now, 30)) + ' 10:00:00'
      const monthlyFee = task.monthlyFee || (task.itemCount * 100)

      specificData = {
        title: `设备租赁跟踪-${dateStr}${String(newTaskId).slice(-3)}`,
        description: `${task.customerName}租赁的${task.itemName}日常巡检`,
        rentalStartDate,
        rentalEndDate,
        monthlyFee,
        status: 'processing',
        statusText: '租赁中',
        lastCheckTime: nowStr,
        nextCheckTime
      }
      break
    }

    case 'depositRefund': {
      const depositAmount = task.depositAmount || (task.itemCount * 500)
      const damageFee = task.damageFee || 0
      const actualRefundAmount = Math.max(0, depositAmount - damageFee)

      specificData = {
        title: `押金退还-${dateStr}${String(newTaskId).slice(-3)}`,
        description: `${task.customerName}租赁${task.itemName}押金退还`,
        depositAmount,
        damageFee,
        actualRefundAmount,
        rentalStartDate: task.rentalStartDate,
        rentalEndDate: task.rentalEndDate,
        acceptanceResult: task.acceptanceResult || '设备完好，无损坏',
        status: 'pending',
        statusText: '待退还'
      }
      break
    }
  }

  return { ...baseTask, ...specificData }
}

function generateOperationLogs(task) {
  const logs = []

  logs.push({
    type: 'create',
    title: '任务创建',
    description: `${task.typeText}任务已创建，等待处理`,
    operator: task.assignee || '系统',
    time: task.createTime
  })

  if (task.status !== 'pending' || task.processTime) {
    logs.push({
      type: 'process',
      title: '开始处理',
      description: `工作人员${task.assignee || ''}开始处理任务`,
      operator: task.assignee || '系统',
      time: task.processTime || task.createTime
    })
  }

  if (task.status === 'completed') {
    const logConfig = getOperationLogConfig(task.type)

    let completeType = 'complete'
    let completeTitle = '任务完成'
    let completeDesc = '任务已完成处理'

    if (logConfig) {
      completeType = logConfig.type
      completeTitle = logConfig.title

      if (logConfig.desc) {
        completeDesc = logConfig.desc
      } else if (logConfig.descField) {
        completeDesc = task[logConfig.descField] || logConfig.defaultDesc || completeDesc
      } else if (logConfig.descTemplate) {
        const amount = task.actualRefundAmount || task.depositAmount || 0
        completeDesc = logConfig.descTemplate.replace('{amount}', amount)
      }
    }

    const typeConfig = getTaskTypeConfig(task.type)
    const timeField = typeConfig ? typeConfig.actualTimeField : null
    const completeTime = timeField && task[timeField] ? task[timeField] : (task.completeTime || task.createTime)

    logs.push({
      type: completeType,
      title: completeTitle,
      description: completeDesc,
      operator: task.assignee || '系统',
      time: completeTime
    })
  }

  return logs
}

function validateTaskType(task, expectedType, res, badRequestResponse) {
  if (task.type !== expectedType) {
    const typeText = getTaskTypeText(expectedType)
    badRequestResponse(res, `该任务不是${typeText}`)
    return false
  }
  return true
}

module.exports = {
  updateTaskStatus,
  createNextTask,
  generateOperationLogs,
  validateTaskType
}
