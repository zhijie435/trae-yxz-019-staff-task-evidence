const express = require('express')
const cors = require('cors')
const tasksRouter = require('./routes/tasks')
const rentalTasksRouter = require('./routes/rentalTasks')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({
    code: 0,
    message: 'ok',
    data: {
      timestamp: new Date().toISOString()
    }
  })
})

app.use('/api/tasks', tasksRouter)
app.use('/api/rental-tasks', rentalTasksRouter)

app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在'
  })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    code: 500,
    message: '服务器内部错误'
  })
})

app.listen(PORT, () => {
  console.log(`任务管理后端服务已启动: http://localhost:${PORT}`)
  console.log(`健康检查: http://localhost:${PORT}/api/health`)
  console.log(`任务列表: http://localhost:${PORT}/api/tasks`)
  console.log(`租赁任务列表: http://localhost:${PORT}/api/rental-tasks`)
  console.log(`租赁任务按类型分组: http://localhost:${PORT}/api/rental-tasks/grouped`)
})
