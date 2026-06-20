const express = require('express')
const router = express.Router()
const tasks = require('../data/mockData')

const statusMap = {
  all: null,
  pending: 'pending',
  processing: 'processing',
  completed: 'completed',
  cancelled: 'cancelled'
}

router.get('/', (req, res) => {
  const { status = 'all' } = req.query
  const filterStatus = statusMap[status]

  let filteredTasks = tasks
  if (filterStatus) {
    filteredTasks = tasks.filter(task => task.status === filterStatus)
  }

  const stats = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    processing: tasks.filter(t => t.status === 'processing').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    cancelled: tasks.filter(t => t.status === 'cancelled').length
  }

  res.json({
    code: 0,
    message: 'success',
    data: {
      list: filteredTasks,
      stats
    }
  })
})

router.get('/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id))
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
