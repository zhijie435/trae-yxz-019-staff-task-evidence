import request from '../utils/request'

export const getTasks = (status = 'all') => {
  return request.get('/tasks', {
    params: { status }
  })
}

export const getTaskDetail = (id) => {
  return request.get(`/tasks/${id}`)
}
