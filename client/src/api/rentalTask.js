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
