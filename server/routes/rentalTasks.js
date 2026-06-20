const express = require('express')
const router = express.Router()
const rentalTasks = require('../data/rentalTasks')
const { TASK_TYPES, getTaskTypeText, getTaskTypeConfig } = require('../constants/taskTypes')
const {
  findTaskById,
  findTaskIndexById,
  notFoundResponse,
  badRequestResponse,
  successResponse
} = require('../utils/helpers')
const {
  updateTaskStatus,
  createNextTask,
  generateOperationLogs,
  validateTaskType
} = require('../services/taskService')

router.get('/', (req, res) => {
  const { type = 'all', status, priority } = req.query

  let filteredTasks = rentalTasks

  if (type !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.type === type)
  }

  if (status) {
    filteredTasks = filteredTasks.filter(task => task.status === status)
  }

  if (priority) {
    filteredTasks = filteredTasks.filter(task => task.priority === priority)
  }

  const stats = { all: rentalTasks.length }
  Object.keys(TASK_TYPES).forEach(typeKey => {
    stats[typeKey] = rentalTasks.filter(t => t.type === typeKey).length
  })

  const typeStats = [
    { type: 'all', typeText: '全部', count: rentalTasks.length },
    ...Object.keys(TASK_TYPES).map(key => ({
      type: key,
      typeText: getTaskTypeText(key),
      count: rentalTasks.filter(t => t.type === key).length
    }))
  ]

  successResponse(res, {
    list: filteredTasks,
    stats,
    typeStats
  })
})

router.get('/grouped', (req, res) => {
  const grouped = {}
  Object.keys(TASK_TYPES).forEach(typeKey => {
    grouped[typeKey] = rentalTasks.filter(t => t.type === typeKey)
  })

  const stats = { all: rentalTasks.length }
  Object.keys(TASK_TYPES).forEach(typeKey => {
    stats[typeKey] = grouped[typeKey].length
  })

  const groups = Object.keys(TASK_TYPES).map(key => ({
    type: key,
    typeText: getTaskTypeText(key),
    list: grouped[key],
    count: grouped[key].length
  }))

  successResponse(res, { groups, stats })
})

router.get('/:id', (req, res) => {
  const task = findTaskById(rentalTasks, req.params.id)
  if (task) {
    successResponse(res, task)
  } else {
    notFoundResponse(res)
  }
})

router.put('/:id/delivery', (req, res) => {
  const taskIndex = findTaskIndexById(rentalTasks, req.params.id)

  if (taskIndex === -1) {
    return notFoundResponse(res)
  }

  const task = rentalTasks[taskIndex]
  if (!validateTaskType(task, 'delivery', res, badRequestResponse)) return

  const { deliveryPhotos, deliveryRemark, actualDeliveryTime } = req.body

  updateTaskStatus(task, 'delivery', {
    actualDeliveryTime,
    deliveryPhotos: deliveryPhotos || [],
    deliveryRemark: deliveryRemark || ''
  })

  const newRentingTask = createNextTask(task, 'delivery', rentalTasks)
  if (newRentingTask) {
    rentalTasks.push(newRentingTask)
  }

  successResponse(res, {
    completedTask: task,
    rentingTask: newRentingTask
  }, '交付确认成功，租赁中任务已创建')
})

router.put('/:id/acceptance', (req, res) => {
  const taskIndex = findTaskIndexById(rentalTasks, req.params.id)

  if (taskIndex === -1) {
    return notFoundResponse(res)
  }

  const task = rentalTasks[taskIndex]
  if (!validateTaskType(task, 'acceptance', res, badRequestResponse)) return

  const {
    acceptanceReport,
    deviceStatusPhotos,
    damageAssessment,
    acceptanceResult,
    damageFee,
    acceptanceRemark,
    actualAcceptanceTime
  } = req.body

  updateTaskStatus(task, 'acceptance', {
    actualAcceptanceTime,
    acceptanceReport: acceptanceReport || [],
    deviceStatusPhotos: deviceStatusPhotos || [],
    damageAssessment: damageAssessment || [],
    acceptanceResult: acceptanceResult || '设备完好，无损坏',
    damageFee: damageFee || 0,
    acceptanceRemark: acceptanceRemark || ''
  })

  const newDepositRefundTask = createNextTask(task, 'acceptance', rentalTasks)
  if (newDepositRefundTask) {
    rentalTasks.push(newDepositRefundTask)
  }

  successResponse(res, {
    completedTask: task,
    depositRefundTask: newDepositRefundTask
  }, '验收确认成功，押金退还任务已创建')
})

router.get('/:id/operation-logs', (req, res) => {
  const task = findTaskById(rentalTasks, req.params.id)

  if (!task) {
    return notFoundResponse(res)
  }

  const logs = generateOperationLogs(task)

  successResponse(res, logs)
})

router.put('/:id/deposit-refund', (req, res) => {
  const taskIndex = findTaskIndexById(rentalTasks, req.params.id)

  if (taskIndex === -1) {
    return notFoundResponse(res)
  }

  const task = rentalTasks[taskIndex]
  if (!validateTaskType(task, 'depositRefund', res, badRequestResponse)) return

  const { refundRemark, actualRefundTime, refundVoucher } = req.body

  updateTaskStatus(task, 'depositRefund', {
    actualRefundTime,
    refundRemark: refundRemark || '',
    refundVoucher: refundVoucher || []
  })

  successResponse(res, task, '押金退还确认成功')
})

router.put('/:id/repair', (req, res) => {
  const taskIndex = findTaskIndexById(rentalTasks, req.params.id)

  if (taskIndex === -1) {
    return notFoundResponse(res)
  }

  const task = rentalTasks[taskIndex]
  if (!validateTaskType(task, 'repair', res, badRequestResponse)) return

  const { repairResult, repairCost, actualRepairTime, repairPhotos, repairRemark } = req.body

  updateTaskStatus(task, 'repair', {
    actualRepairTime,
    repairResult: repairResult || '设备已维修完成',
    repairCost: repairCost || 0,
    repairPhotos: repairPhotos || [],
    repairRemark: repairRemark || ''
  })

  const relatedRentingTask = rentalTasks.find(t =>
    t.type === 'renting' &&
    t.customerName === task.customerName &&
    t.itemName === task.itemName &&
    t.inAfterSales
  )

  if (relatedRentingTask) {
    relatedRentingTask.inAfterSales = false
    relatedRentingTask.statusText = '租赁中'
  }

  successResponse(res, {
    completedTask: task,
    updatedRentingTask: relatedRentingTask || null
  }, '维修确认成功，售后中状态已关闭')
})

module.exports = router
