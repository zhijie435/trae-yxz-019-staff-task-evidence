const express = require('express')
const router = express.Router()
const rentalTasks = require('../data/rentalTasks')

const typeMap = {
  all: null,
  delivery: 'delivery',
  renting: 'renting',
  acceptance: 'acceptance',
  repair: 'repair',
  depositRefund: 'depositRefund'
}

const typeTextMap = {
  all: '全部',
  delivery: '交付任务',
  renting: '租赁中任务',
  acceptance: '验收任务',
  repair: '报修任务',
  depositRefund: '押金退还任务'
}

router.get('/', (req, res) => {
  const { type = 'all', status, priority } = req.query
  const filterType = typeMap[type]

  let filteredTasks = rentalTasks

  if (filterType) {
    filteredTasks = filteredTasks.filter(task => task.type === filterType)
  }

  if (status) {
    filteredTasks = filteredTasks.filter(task => task.status === status)
  }

  if (priority) {
    filteredTasks = filteredTasks.filter(task => task.priority === priority)
  }

  const stats = {
    all: rentalTasks.length,
    delivery: rentalTasks.filter(t => t.type === 'delivery').length,
    renting: rentalTasks.filter(t => t.type === 'renting').length,
    acceptance: rentalTasks.filter(t => t.type === 'acceptance').length,
    repair: rentalTasks.filter(t => t.type === 'repair').length,
    depositRefund: rentalTasks.filter(t => t.type === 'depositRefund').length
  }

  const typeStats = Object.keys(typeTextMap).map(key => ({
    type: key,
    typeText: typeTextMap[key],
    count: key === 'all' ? rentalTasks.length : rentalTasks.filter(t => t.type === key).length
  }))

  res.json({
    code: 0,
    message: 'success',
    data: {
      list: filteredTasks,
      stats,
      typeStats
    }
  })
})

router.get('/grouped', (req, res) => {
  const grouped = {
    delivery: rentalTasks.filter(t => t.type === 'delivery'),
    renting: rentalTasks.filter(t => t.type === 'renting'),
    acceptance: rentalTasks.filter(t => t.type === 'acceptance'),
    repair: rentalTasks.filter(t => t.type === 'repair'),
    depositRefund: rentalTasks.filter(t => t.type === 'depositRefund')
  }

  const stats = {
    all: rentalTasks.length,
    delivery: grouped.delivery.length,
    renting: grouped.renting.length,
    acceptance: grouped.acceptance.length,
    repair: grouped.repair.length,
    depositRefund: grouped.depositRefund.length
  }

  res.json({
    code: 0,
    message: 'success',
    data: {
      groups: [
        { type: 'delivery', typeText: '交付任务', list: grouped.delivery, count: grouped.delivery.length },
        { type: 'renting', typeText: '租赁中任务', list: grouped.renting, count: grouped.renting.length },
        { type: 'acceptance', typeText: '验收任务', list: grouped.acceptance, count: grouped.acceptance.length },
        { type: 'depositRefund', typeText: '押金退还任务', list: grouped.depositRefund, count: grouped.depositRefund.length },
        { type: 'repair', typeText: '报修任务', list: grouped.repair, count: grouped.repair.length }
      ],
      stats
    }
  })
})

router.get('/:id', (req, res) => {
  const task = rentalTasks.find(t => t.id === parseInt(req.params.id))
  if (task) {
    res.json({
      code: 0,
      message: 'success',
      data: task
    })
  } else {
    res.status(404).json({
      code: 404,
      message: '任务不存在'
    })
  }
})

router.put('/:id/delivery', (req, res) => {
  const taskId = parseInt(req.params.id)
  const { deliveryPhotos, deliveryRemark, actualDeliveryTime } = req.body
  const taskIndex = rentalTasks.findIndex(t => t.id === taskId)

  if (taskIndex === -1) {
    return res.status(404).json({
      code: 404,
      message: '任务不存在'
    })
  }

  const task = rentalTasks[taskIndex]
  if (task.type !== 'delivery') {
    return res.status(400).json({
      code: 400,
      message: '该任务不是交付任务'
    })
  }

  task.status = 'completed'
  task.statusText = '已交付'
  task.actualDeliveryTime = actualDeliveryTime || new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  task.deliveryPhotos = deliveryPhotos || []
  task.deliveryRemark = deliveryRemark || ''

  const now = new Date()
  const nowStr = now.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '')

  const maxId = rentalTasks.reduce((max, t) => Math.max(max, t.id), 0)
  const newTaskId = Math.max(2000, maxId) + 1

  const rentalStartDate = now.toISOString().split('T')[0]
  const rentalEndDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const nextCheckTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 10:00:00'

  const monthlyFee = task.monthlyFee || (task.itemCount * 100)

  const newRentingTask = {
    id: newTaskId,
    title: `设备租赁跟踪-${dateStr}${String(newTaskId).slice(-3)}`,
    type: 'renting',
    typeText: '租赁中任务',
    description: `${task.customerName}租赁的${task.itemName}日常巡检`,
    itemName: task.itemName,
    itemCount: task.itemCount,
    customerName: task.customerName,
    customerContact: task.customerContact,
    customerPhone: task.customerPhone,
    rentalStartDate,
    rentalEndDate,
    monthlyFee,
    status: 'processing',
    statusText: '租赁中',
    priority: task.priority,
    priorityText: task.priorityText,
    createTime: nowStr,
    lastCheckTime: nowStr,
    nextCheckTime,
    assignee: task.assignee || '赵运维'
  }

  rentalTasks.push(newRentingTask)

  res.json({
    code: 0,
    message: '交付确认成功，租赁中任务已创建',
    data: {
      completedTask: task,
      rentingTask: newRentingTask
    }
  })
})

router.put('/:id/acceptance', (req, res) => {
  const taskId = parseInt(req.params.id)
  const { acceptanceReport, deviceStatusPhotos, damageAssessment,
          acceptanceResult, damageFee, acceptanceRemark, actualAcceptanceTime } = req.body
  const taskIndex = rentalTasks.findIndex(t => t.id === taskId)

  if (taskIndex === -1) {
    return res.status(404).json({
      code: 404,
      message: '任务不存在'
    })
  }

  const task = rentalTasks[taskIndex]
  if (task.type !== 'acceptance') {
    return res.status(400).json({
      code: 400,
      message: '该任务不是验收任务'
    })
  }

  task.status = 'completed'
  task.statusText = '验收通过'
  task.actualAcceptanceTime = actualAcceptanceTime || new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  task.acceptanceReport = acceptanceReport || []
  task.deviceStatusPhotos = deviceStatusPhotos || []
  task.damageAssessment = damageAssessment || []
  task.acceptanceResult = acceptanceResult || '设备完好，无损坏'
  task.damageFee = damageFee || 0
  task.acceptanceRemark = acceptanceRemark || ''

  const now = new Date()
  const nowStr = now.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '')

  const maxId = rentalTasks.reduce((max, t) => Math.max(max, t.id), 0)
  const newTaskId = Math.max(5000, maxId) + 1

  const depositAmount = task.depositAmount || (task.itemCount * 500)
  const actualRefundAmount = Math.max(0, depositAmount - (damageFee || 0))

  const newDepositRefundTask = {
    id: newTaskId,
    title: `押金退还-${dateStr}${String(newTaskId).slice(-3)}`,
    type: 'depositRefund',
    typeText: '押金退还任务',
    description: `${task.customerName}租赁${task.itemName}押金退还`,
    itemName: task.itemName,
    itemCount: task.itemCount,
    customerName: task.customerName,
    customerContact: task.customerContact,
    customerPhone: task.customerPhone,
    depositAmount,
    damageFee: damageFee || 0,
    actualRefundAmount,
    rentalStartDate: task.rentalStartDate,
    rentalEndDate: task.rentalEndDate,
    acceptanceResult: acceptanceResult || '设备完好，无损坏',
    status: 'pending',
    statusText: '待退还',
    priority: task.priority,
    priorityText: task.priorityText,
    createTime: nowStr,
    assignee: '钱财务'
  }

  rentalTasks.push(newDepositRefundTask)

  res.json({
    code: 0,
    message: '验收确认成功，押金退还任务已创建',
    data: {
      completedTask: task,
      depositRefundTask: newDepositRefundTask
    }
  })
})

router.get('/:id/operation-logs', (req, res) => {
  const taskId = parseInt(req.params.id)
  const task = rentalTasks.find(t => t.id === taskId)

  if (!task) {
    return res.status(404).json({
      code: 404,
      message: '任务不存在'
    })
  }

  const logs = generateOperationLogs(task)

  res.json({
    code: 0,
    message: 'success',
    data: logs
  })
})

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
    let completeType = 'complete'
    let completeTitle = '任务完成'
    let completeDesc = '任务已完成处理'

    if (task.type === 'delivery') {
      completeType = 'delivery'
      completeTitle = '交付完成'
      completeDesc = '物品已成功交付给客户'
    } else if (task.type === 'acceptance') {
      completeType = 'acceptance'
      completeTitle = '验收完成'
      completeDesc = task.acceptanceResult || '设备验收通过'
    } else if (task.type === 'repair') {
      completeType = 'repair'
      completeTitle = '维修完成'
      completeDesc = task.repairResult || '设备已维修完成'
    } else if (task.type === 'renting') {
      completeType = 'inspect'
      completeTitle = '巡检完成'
      completeDesc = '设备巡检完成，状态正常'
    } else if (task.type === 'depositRefund') {
      completeType = 'refund'
      completeTitle = '押金已退还'
      completeDesc = `押金已退还，实际退还金额¥${task.actualRefundAmount || task.depositAmount || 0}`
    }

    logs.push({
      type: completeType,
      title: completeTitle,
      description: completeDesc,
      operator: task.assignee || '系统',
      time: task.completeTime || task.actualDeliveryTime || task.actualAcceptanceTime || task.actualRepairTime || task.createTime
    })
  }

  return logs
}

router.put('/:id/deposit-refund', (req, res) => {
  const taskId = parseInt(req.params.id)
  const { refundRemark, actualRefundTime, refundVoucher } = req.body
  const taskIndex = rentalTasks.findIndex(t => t.id === taskId)

  if (taskIndex === -1) {
    return res.status(404).json({
      code: 404,
      message: '任务不存在'
    })
  }

  const task = rentalTasks[taskIndex]
  if (task.type !== 'depositRefund') {
    return res.status(400).json({
      code: 400,
      message: '该任务不是押金退还任务'
    })
  }

  task.status = 'completed'
  task.statusText = '已退还'
  task.actualRefundTime = actualRefundTime || new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  task.refundRemark = refundRemark || ''
  task.refundVoucher = refundVoucher || []

  res.json({
    code: 0,
    message: '押金退还确认成功',
    data: task
  })
})

module.exports = router
