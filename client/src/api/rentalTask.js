import request from '../utils/request'

export const getRentalTasks = (params = {}) => {
  return request.get('/rental-tasks', { params })
}

export const getRentalTasksGrouped = () => {
  return request.get('/rental-tasks/grouped')
}

export const getRentalTaskDetail = (id) => {
  return request.get(`/rental-tasks/${id}`)
}

export const confirmDelivery = (id, data) => {
  return request.put(`/rental-tasks/${id}/delivery`, data)
}

export const confirmAcceptance = (id, data) => {
  return request.put(`/rental-tasks/${id}/acceptance`, data)
}

export const getTaskOperationLogs = (id) => {
  return request.get(`/rental-tasks/${id}/operation-logs`)
}
