const express = require('express')
const router = express.Router()
const rentalTasks = require('../data/rentalTasks')

const typeMap = {
  all: null,
  delivery: 'delivery',
  renting: 'renting',
  acceptance: 'acceptance',
  repair: 'repair'
}

const typeTextMap = {
  all: '全部',
  delivery: '交付任务',
  renting: '租赁中任务',
  acceptance: '验收任务',
  repair: '报修任务'
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
    repair: rentalTasks.filter(t => t.type === 'repair').length
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
    repair: rentalTasks.filter(t => t.type === 'repair')
  }

  const stats = {
    all: rentalTasks.length,
    delivery: grouped.delivery.length,
    renting: grouped.renting.length,
    acceptance: grouped.acceptance.length,
    repair: grouped.repair.length
  }

  res.json({
    code: 0,
    message: 'success',
    data: {
      groups: [
        { type: 'delivery', typeText: '交付任务', list: grouped.delivery, count: grouped.delivery.length },
        { type: 'renting', typeText: '租赁中任务', list: grouped.renting, count: grouped.renting.length },
        { type: 'acceptance', typeText: '验收任务', list: grouped.acceptance, count: grouped.acceptance.length },
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

module.exports = router
