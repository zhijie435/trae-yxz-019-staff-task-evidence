const {
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
} = require('../utils/helpers')

describe('工具函数测试', () => {
  describe('padZero (内部函数，通过 formatDateTime 间接测试)', () => {
    test('formatDateTime 应正确格式化日期时间', () => {
      const date = new Date('2026-06-20T14:30:00')
      const result = formatDateTime(date)
      expect(result).toBe('2026-06-20 14:30:00')
    })

    test('formatDateTime 应正确补零', () => {
      const date = new Date('2026-01-05T09:05:03')
      const result = formatDateTime(date)
      expect(result).toBe('2026-01-05 09:05:03')
    })

    test('formatDateTime 不传参数时使用当前时间', () => {
      const before = new Date()
      const result = formatDateTime()
      const after = new Date()
      const resultDate = new Date(result.replace(' ', 'T'))
      expect(resultDate.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000)
      expect(resultDate.getTime()).toBeLessThanOrEqual(after.getTime() + 1000)
    })
  })

  describe('formatDate', () => {
    test('应正确格式化日期为 YYYY-MM-DD', () => {
      const date = new Date('2026-06-20T14:30:00')
      const result = formatDate(date)
      expect(result).toBe('2026-06-20')
    })

    test('不传参数时使用当前日期', () => {
      const today = new Date().toISOString().split('T')[0]
      const result = formatDate()
      expect(result).toBe(today)
    })
  })

  describe('formatDateCompact', () => {
    test('应正确格式化日期为 YYYYMMDD', () => {
      const date = new Date('2026-06-20T14:30:00')
      const result = formatDateCompact(date)
      expect(result).toBe('20260620')
    })

    test('不传参数时使用当前日期', () => {
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
      const result = formatDateCompact()
      expect(result).toBe(today)
    })
  })

  describe('addDays', () => {
    test('应正确添加天数', () => {
      const date = new Date('2026-06-20')
      const result = addDays(date, 5)
      expect(result.getDate()).toBe(25)
      expect(result.getMonth()).toBe(5)
      expect(result.getFullYear()).toBe(2026)
    })

    test('应正确跨月添加天数', () => {
      const date = new Date('2026-06-28')
      const result = addDays(date, 5)
      expect(result.getDate()).toBe(3)
      expect(result.getMonth()).toBe(6)
    })

    test('应正确跨年添加天数', () => {
      const date = new Date('2026-12-29')
      const result = addDays(date, 5)
      expect(result.getDate()).toBe(3)
      expect(result.getMonth()).toBe(0)
      expect(result.getFullYear()).toBe(2027)
    })

    test('添加 0 天应返回相同日期', () => {
      const date = new Date('2026-06-20')
      const result = addDays(date, 0)
      expect(result.toDateString()).toBe(date.toDateString())
    })

    test('不应修改原始日期', () => {
      const date = new Date('2026-06-20')
      const originalTime = date.getTime()
      addDays(date, 5)
      expect(date.getTime()).toBe(originalTime)
    })
  })

  describe('generateTaskId', () => {
    test('应基于前缀生成新的任务ID', () => {
      const tasks = [{ id: 1001 }, { id: 1002 }, { id: 1003 }]
      const result = generateTaskId(tasks, 1000)
      expect(result).toBe(1004)
    })

    test('当任务列表为空时应返回 prefix + 1', () => {
      const tasks = []
      const result = generateTaskId(tasks, 1000)
      expect(result).toBe(1001)
    })

    test('当 prefix 大于最大 ID 时应返回 prefix + 1', () => {
      const tasks = [{ id: 1001 }, { id: 1002 }]
      const result = generateTaskId(tasks, 2000)
      expect(result).toBe(2001)
    })
  })

  describe('findTaskById', () => {
    const tasks = [
      { id: 1, name: '任务1' },
      { id: 2, name: '任务2' },
      { id: 3, name: '任务3' }
    ]

    test('应找到存在的任务', () => {
      const result = findTaskById(tasks, 2)
      expect(result).toEqual({ id: 2, name: '任务2' })
    })

    test('应支持字符串类型的ID', () => {
      const result = findTaskById(tasks, '2')
      expect(result).toEqual({ id: 2, name: '任务2' })
    })

    test('找不到任务时应返回 undefined', () => {
      const result = findTaskById(tasks, 999)
      expect(result).toBeUndefined()
    })

    test('空任务列表应返回 undefined', () => {
      const result = findTaskById([], 1)
      expect(result).toBeUndefined()
    })
  })

  describe('findTaskIndexById', () => {
    const tasks = [
      { id: 1, name: '任务1' },
      { id: 2, name: '任务2' },
      { id: 3, name: '任务3' }
    ]

    test('应找到存在任务的索引', () => {
      const result = findTaskIndexById(tasks, 2)
      expect(result).toBe(1)
    })

    test('应支持字符串类型的ID', () => {
      const result = findTaskIndexById(tasks, '2')
      expect(result).toBe(1)
    })

    test('找不到任务时应返回 -1', () => {
      const result = findTaskIndexById(tasks, 999)
      expect(result).toBe(-1)
    })

    test('空任务列表应返回 -1', () => {
      const result = findTaskIndexById([], 1)
      expect(result).toBe(-1)
    })
  })

  describe('响应辅助函数', () => {
    let mockRes

    beforeEach(() => {
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      }
    })

    test('notFoundResponse 应返回 404 状态', () => {
      notFoundResponse(mockRes)
      expect(mockRes.status).toHaveBeenCalledWith(404)
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 404,
        message: '任务不存在'
      })
    })

    test('notFoundResponse 应支持自定义消息', () => {
      notFoundResponse(mockRes, '数据不存在')
      expect(mockRes.status).toHaveBeenCalledWith(404)
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 404,
        message: '数据不存在'
      })
    })

    test('badRequestResponse 应返回 400 状态', () => {
      badRequestResponse(mockRes, '参数错误')
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 400,
        message: '参数错误'
      })
    })

    test('successResponse 应返回成功响应', () => {
      const data = { id: 1, name: '测试' }
      successResponse(mockRes, data)
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 0,
        message: 'success',
        data
      })
    })

    test('successResponse 应支持自定义消息', () => {
      const data = { id: 1, name: '测试' }
      successResponse(mockRes, data, '操作成功')
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 0,
        message: '操作成功',
        data
      })
    })
  })
})
