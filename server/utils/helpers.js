function padZero(num) {
  return String(num).padStart(2, '0')
}

function formatDateTime(date) {
  const d = date || new Date()
  const year = d.getFullYear()
  const month = padZero(d.getMonth() + 1)
  const day = padZero(d.getDate())
  const hours = padZero(d.getHours())
  const minutes = padZero(d.getMinutes())
  const seconds = padZero(d.getSeconds())
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

function formatDate(date) {
  const d = date || new Date()
  return d.toISOString().split('T')[0]
}

function formatDateCompact(date) {
  const d = date || new Date()
  return d.toISOString().split('T')[0].replace(/-/g, '')
}

function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function generateTaskId(tasks, prefix) {
  const maxId = tasks.reduce((max, t) => Math.max(max, t.id), 0)
  return Math.max(prefix, maxId) + 1
}

function findTaskById(tasks, id) {
  const taskId = parseInt(id)
  return tasks.find(t => t.id === taskId)
}

function findTaskIndexById(tasks, id) {
  const taskId = parseInt(id)
  return tasks.findIndex(t => t.id === taskId)
}

function notFoundResponse(res, message = '任务不存在') {
  return res.status(404).json({
    code: 404,
    message
  })
}

function badRequestResponse(res, message) {
  return res.status(400).json({
    code: 400,
    message
  })
}

function successResponse(res, data, message = 'success') {
  return res.json({
    code: 0,
    message,
    data
  })
}

module.exports = {
  formatDateTime,
  formatDate,
  formatDateCompact,
  addDays,
  generateTaskId,
  findTaskById,
  findTaskIndexById,
  notFoundResponse,
  badRequestResponse,
  successResponse
}
