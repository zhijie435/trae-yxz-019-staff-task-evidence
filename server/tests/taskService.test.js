const {
  updateTaskStatus,
  createNextTask,
  generateOperationLogs,
  validateTaskType
} = require('../services/taskService')

describe('任务服务测试', () => {
  describe('updateTaskStatus - 任务状态更新', () => {
    test('应正确更新交付任务状态为已完成', () => {
      const task = {
        id: 1001,
        type: 'delivery',
        status: 'pending',
        statusText: '待交付'
      }

      const result = updateTaskStatus(task, 'delivery', {
        actualDeliveryTime: '2026-06-20 14:00:00',
        deliveryPhotos: ['photo1.jpg', 'photo2.jpg'],
        deliveryRemark: '物品完好交付'
      })

      expect(result.status).toBe('completed')
      expect(result.statusText).toBe('已交付')
      expect(result.actualDeliveryTime).toBe('2026-06-20 14:00:00')
      expect(result.deliveryPhotos).toEqual(['photo1.jpg', 'photo2.jpg'])
      expect(result.deliveryRemark).toBe('物品完好交付')
    })

    test('应正确更新验收任务状态为已完成', () => {
      const task = {
        id: 3001,
        type: 'acceptance',
        status: 'pending',
        statusText: '待验收'
      }

      const result = updateTaskStatus(task, 'acceptance', {
        actualAcceptanceTime: '2026-06-20 10:00:00',
        acceptanceReport: ['report.pdf'],
        deviceStatusPhotos: ['photo1.jpg'],
        damageAssessment: ['damage.pdf'],
        acceptanceResult: '设备完好，无损坏',
        damageFee: 0,
        acceptanceRemark: '验收通过'
      })

      expect(result.status).toBe('completed')
      expect(result.statusText).toBe('验收通过')
      expect(result.actualAcceptanceTime).toBe('2026-06-20 10:00:00')
      expect(result.acceptanceResult).toBe('设备完好，无损坏')
      expect(result.damageFee).toBe(0)
    })

    test('应正确更新报修任务状态为已完成', () => {
      const task = {
        id: 4001,
        type: 'repair',
        status: 'pending',
        statusText: '待处理'
      }

      const result = updateTaskStatus(task, 'repair', {
        actualRepairTime: '2026-06-20 16:00:00',
        repairResult: '设备已维修完成',
        repairCost: 500,
        repairPhotos: ['photo1.jpg'],
        repairRemark: '更换了零件'
      })

      expect(result.status).toBe('completed')
      expect(result.statusText).toBe('已完成')
      expect(result.actualRepairTime).toBe('2026-06-20 16:00:00')
      expect(result.repairResult).toBe('设备已维修完成')
      expect(result.repairCost).toBe(500)
    })

    test('不存在的任务类型应返回 null', () => {
      const task = { id: 1, type: 'unknown' }
      const result = updateTaskStatus(task, 'unknown', {})
      expect(result).toBeNull()
    })

    test('未提供时间字段时应自动生成', () => {
      const task = {
        id: 1001,
        type: 'delivery',
        status: 'pending',
        statusText: '待交付'
      }

      const beforeTime = Date.now()
      const result = updateTaskStatus(task, 'delivery', {})
      const afterTime = Date.now()

      expect(result.actualDeliveryTime).toBeDefined()
      const resultTime = new Date(result.actualDeliveryTime.replace(' ', 'T')).getTime()
      expect(resultTime).toBeGreaterThanOrEqual(beforeTime - 1000)
      expect(resultTime).toBeLessThanOrEqual(afterTime + 1000)
    })

    test('应修改原始任务对象', () => {
      const task = {
        id: 1001,
        type: 'delivery',
        status: 'pending',
        statusText: '待交付'
      }

      updateTaskStatus(task, 'delivery', { actualDeliveryTime: '2026-06-20 14:00:00' })

      expect(task.status).toBe('completed')
      expect(task.statusText).toBe('已交付')
    })
  })

  describe('createNextTask - 创建后续任务', () => {
    const baseTask = {
      id: 1001,
      type: 'delivery',
      typeText: '交付任务',
      itemName: '笔记本电脑',
      itemCount: 10,
      customerName: 'A科技有限公司',
      customerContact: '张经理',
      customerPhone: '13800138001',
      priority: 'high',
      priorityText: '高',
      createTime: '2026-06-18 09:30:00'
    }

    test('交付任务完成后应创建租赁中任务', () => {
      const tasks = [{ id: 2001, type: 'renting' }]
      const result = createNextTask(baseTask, 'delivery', tasks)

      expect(result).not.toBeNull()
      expect(result.type).toBe('renting')
      expect(result.typeText).toBe('租赁中任务')
      expect(result.itemName).toBe(baseTask.itemName)
      expect(result.itemCount).toBe(baseTask.itemCount)
      expect(result.customerName).toBe(baseTask.customerName)
      expect(result.customerContact).toBe(baseTask.customerContact)
      expect(result.customerPhone).toBe(baseTask.customerPhone)
      expect(result.priority).toBe(baseTask.priority)
      expect(result.priorityText).toBe(baseTask.priorityText)
      expect(result.status).toBe('processing')
      expect(result.statusText).toBe('租赁中')
    })

    test('验收任务完成后应创建押金退还任务', () => {
      const acceptanceTask = {
        ...baseTask,
        id: 3001,
        type: 'acceptance',
        rentalStartDate: '2026-03-15',
        rentalEndDate: '2026-06-15',
        acceptanceResult: '设备完好，无损坏',
        depositAmount: 5000,
        damageFee: 0
      }

      const tasks = [{ id: 5001, type: 'depositRefund' }]
      const result = createNextTask(acceptanceTask, 'acceptance', tasks)

      expect(result).not.toBeNull()
      expect(result.type).toBe('depositRefund')
      expect(result.typeText).toBe('押金退还任务')
      expect(result.depositAmount).toBe(5000)
      expect(result.damageFee).toBe(0)
      expect(result.actualRefundAmount).toBe(5000)
      expect(result.acceptanceResult).toBe('设备完好，无损坏')
      expect(result.status).toBe('pending')
      expect(result.statusText).toBe('待退还')
    })

    test('有损坏费用时应正确计算实际退还金额', () => {
      const acceptanceTask = {
        ...baseTask,
        id: 3002,
        type: 'acceptance',
        rentalStartDate: '2026-03-15',
        rentalEndDate: '2026-06-15',
        acceptanceResult: '设备有轻微损坏',
        depositAmount: 5000,
        damageFee: 500
      }

      const tasks = []
      const result = createNextTask(acceptanceTask, 'acceptance', tasks)

      expect(result.actualRefundAmount).toBe(4500)
    })

    test('损坏费用超过押金时实际退还金额为0', () => {
      const acceptanceTask = {
        ...baseTask,
        id: 3003,
        type: 'acceptance',
        depositAmount: 500,
        damageFee: 1000
      }

      const tasks = []
      const result = createNextTask(acceptanceTask, 'acceptance', tasks)

      expect(result.actualRefundAmount).toBe(0)
    })

    test('报修任务完成后不创建后续任务', () => {
      const repairTask = {
        ...baseTask,
        id: 4001,
        type: 'repair'
      }

      const result = createNextTask(repairTask, 'repair', [])
      expect(result).toBeNull()
    })

    test('不存在的任务类型应返回 null', () => {
      const result = createNextTask(baseTask, 'unknown', [])
      expect(result).toBeNull()
    })

    test('生成的任务ID应正确递增', () => {
      const tasks = [
        { id: 2001, type: 'renting' },
        { id: 2002, type: 'renting' },
        { id: 2003, type: 'renting' }
      ]

      const result = createNextTask(baseTask, 'delivery', tasks)
      expect(result.id).toBe(2004)
    })
  })

  describe('generateOperationLogs - 生成操作日志', () => {
    test('待处理任务应只有创建日志', () => {
      const task = {
        id: 1001,
        type: 'delivery',
        typeText: '交付任务',
        status: 'pending',
        createTime: '2026-06-18 09:30:00',
        assignee: '李送货'
      }

      const logs = generateOperationLogs(task)

      expect(logs.length).toBe(1)
      expect(logs[0].type).toBe('create')
      expect(logs[0].title).toBe('任务创建')
      expect(logs[0].operator).toBe('李送货')
      expect(logs[0].time).toBe('2026-06-18 09:30:00')
    })

    test('进行中任务应有创建和处理日志', () => {
      const task = {
        id: 1002,
        type: 'delivery',
        typeText: '交付任务',
        status: 'processing',
        createTime: '2026-06-18 09:30:00',
        processTime: '2026-06-19 10:00:00',
        assignee: '李送货'
      }

      const logs = generateOperationLogs(task)

      expect(logs.length).toBe(2)
      expect(logs[0].type).toBe('create')
      expect(logs[1].type).toBe('process')
      expect(logs[1].title).toBe('开始处理')
    })

    test('已完成的交付任务应有三条日志', () => {
      const task = {
        id: 1003,
        type: 'delivery',
        typeText: '交付任务',
        status: 'completed',
        createTime: '2026-06-18 09:30:00',
        processTime: '2026-06-19 10:00:00',
        actualDeliveryTime: '2026-06-20 14:00:00',
        assignee: '李送货'
      }

      const logs = generateOperationLogs(task)

      expect(logs.length).toBe(3)
      expect(logs[2].type).toBe('delivery')
      expect(logs[2].title).toBe('交付完成')
      expect(logs[2].description).toBe('物品已成功交付给客户')
    })

    test('已完成的验收任务应有验收结果描述', () => {
      const task = {
        id: 3001,
        type: 'acceptance',
        typeText: '验收任务',
        status: 'completed',
        createTime: '2026-06-15 08:00:00',
        actualAcceptanceTime: '2026-06-22 10:00:00',
        acceptanceResult: '设备完好，无损坏',
        assignee: '郑验收'
      }

      const logs = generateOperationLogs(task)

      expect(logs.length).toBe(3)
      expect(logs[2].type).toBe('acceptance')
      expect(logs[2].title).toBe('验收完成')
      expect(logs[2].description).toBe('设备完好，无损坏')
    })

    test('验收任务无验收结果时使用默认描述', () => {
      const task = {
        id: 3002,
        type: 'acceptance',
        typeText: '验收任务',
        status: 'completed',
        createTime: '2026-06-15 08:00:00',
        assignee: '郑验收'
      }

      const logs = generateOperationLogs(task)

      expect(logs[2].description).toBe('设备验收通过')
    })

    test('已完成的报修任务应有维修结果描述', () => {
      const task = {
        id: 4001,
        type: 'repair',
        typeText: '报修任务',
        status: 'completed',
        createTime: '2026-06-18 11:00:00',
        actualRepairTime: '2026-06-20 16:00:00',
        repairResult: '更换扫描头，设备恢复正常',
        assignee: '黄维修'
      }

      const logs = generateOperationLogs(task)

      expect(logs.length).toBe(3)
      expect(logs[2].type).toBe('repair')
      expect(logs[2].title).toBe('维修完成')
      expect(logs[2].description).toBe('更换扫描头，设备恢复正常')
    })

    test('押金退还任务应有金额模板描述', () => {
      const task = {
        id: 5001,
        type: 'depositRefund',
        typeText: '押金退还任务',
        status: 'completed',
        createTime: '2026-06-20 10:00:00',
        actualRefundTime: '2026-06-21 14:00:00',
        actualRefundAmount: 4500,
        assignee: '钱财务'
      }

      const logs = generateOperationLogs(task)

      expect(logs.length).toBe(3)
      expect(logs[2].type).toBe('refund')
      expect(logs[2].title).toBe('押金已退还')
      expect(logs[2].description).toBe('押金已退还，实际退还金额¥4500')
    })
  })

  describe('validateTaskType - 验证任务类型', () => {
    let mockRes
    let mockBadRequest

    beforeEach(() => {
      mockRes = {}
      mockBadRequest = jest.fn()
    })

    test('任务类型匹配时应返回 true', () => {
      const task = { id: 1001, type: 'delivery' }
      const result = validateTaskType(task, 'delivery', mockRes, mockBadRequest)

      expect(result).toBe(true)
      expect(mockBadRequest).not.toHaveBeenCalled()
    })

    test('任务类型不匹配时应返回 false 并调用 badRequestResponse', () => {
      const task = { id: 1001, type: 'delivery' }
      const result = validateTaskType(task, 'acceptance', mockRes, mockBadRequest)

      expect(result).toBe(false)
      expect(mockBadRequest).toHaveBeenCalledWith(mockRes, '该任务不是验收任务')
    })
  })
})

describe('任务筛选功能测试', () => {
  const rentalTasks = require('../data/rentalTasks')

  test('筛选全部任务 - 全部类型', () => {
    const type = 'all'
    const filtered = type === 'all'
      ? rentalTasks
      : rentalTasks.filter(task => task.type === type)

    expect(filtered.length).toBe(rentalTasks.length)
    expect(filtered.length).toBeGreaterThan(0)
  })

  test('筛选交付任务', () => {
    const type = 'delivery'
    const filtered = rentalTasks.filter(task => task.type === type)

    expect(filtered.length).toBe(3)
    filtered.forEach(task => {
      expect(task.type).toBe('delivery')
    })
  })

  test('筛选租赁中任务', () => {
    const type = 'renting'
    const filtered = rentalTasks.filter(task => task.type === type)

    expect(filtered.length).toBe(6)
    filtered.forEach(task => {
      expect(task.type).toBe('renting')
    })
  })

  test('筛选验收任务', () => {
    const type = 'acceptance'
    const filtered = rentalTasks.filter(task => task.type === type)

    expect(filtered.length).toBe(4)
    filtered.forEach(task => {
      expect(task.type).toBe('acceptance')
    })
  })

  test('筛选报修任务', () => {
    const type = 'repair'
    const filtered = rentalTasks.filter(task => task.type === type)

    expect(filtered.length).toBe(5)
    filtered.forEach(task => {
      expect(task.type).toBe('repair')
    })
  })

  test('筛选押金退还任务', () => {
    const type = 'depositRefund'
    const filtered = rentalTasks.filter(task => task.type === type)

    expect(filtered.length).toBe(0)
  })

  test('按状态筛选 - 待处理', () => {
    const status = 'pending'
    const filtered = rentalTasks.filter(task => task.status === status)

    expect(filtered.length).toBeGreaterThan(0)
    filtered.forEach(task => {
      expect(task.status).toBe('pending')
    })
  })

  test('按状态筛选 - 进行中', () => {
    const status = 'processing'
    const filtered = rentalTasks.filter(task => task.status === status)

    expect(filtered.length).toBeGreaterThan(0)
    filtered.forEach(task => {
      expect(task.status).toBe('processing')
    })
  })

  test('按状态筛选 - 已完成', () => {
    const status = 'completed'
    const filtered = rentalTasks.filter(task => task.status === status)

    expect(filtered.length).toBeGreaterThan(0)
    filtered.forEach(task => {
      expect(task.status).toBe('completed')
    })
  })

  test('按优先级筛选 - 高优先级', () => {
    const priority = 'high'
    const filtered = rentalTasks.filter(task => task.priority === priority)

    expect(filtered.length).toBeGreaterThan(0)
    filtered.forEach(task => {
      expect(task.priority).toBe('high')
    })
  })

  test('组合筛选 - 交付任务 + 待处理状态', () => {
    const type = 'delivery'
    const status = 'pending'
    const filtered = rentalTasks.filter(
      task => task.type === type && task.status === status
    )

    expect(filtered.length).toBeGreaterThan(0)
    filtered.forEach(task => {
      expect(task.type).toBe('delivery')
      expect(task.status).toBe('pending')
    })
  })

  test('组合筛选 - 报修任务 + 高优先级 + 进行中', () => {
    const type = 'repair'
    const status = 'processing'
    const priority = 'high'
    const filtered = rentalTasks.filter(
      task => task.type === type && task.status === status && task.priority === priority
    )

    filtered.forEach(task => {
      expect(task.type).toBe('repair')
      expect(task.status).toBe('processing')
      expect(task.priority).toBe('high')
    })
  })

  test('统计各类型任务数量', () => {
    const stats = { all: rentalTasks.length }
    const typeKeys = ['delivery', 'renting', 'acceptance', 'depositRefund', 'repair']

    typeKeys.forEach(typeKey => {
      stats[typeKey] = rentalTasks.filter(t => t.type === typeKey).length
    })

    expect(stats.all).toBe(rentalTasks.length)
    expect(stats.delivery).toBe(3)
    expect(stats.renting).toBe(6)
    expect(stats.acceptance).toBe(4)
    expect(stats.depositRefund).toBe(0)
    expect(stats.repair).toBe(5)
  })
})

describe('交付凭证功能测试', () => {
  test('交付凭证应包含照片和备注', () => {
    const deliveryData = {
      deliveryPhotos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
      deliveryRemark: '物品完好无损，客户已签收'
    }

    expect(deliveryData.deliveryPhotos).toBeDefined()
    expect(Array.isArray(deliveryData.deliveryPhotos)).toBe(true)
    expect(deliveryData.deliveryPhotos.length).toBe(3)
    expect(deliveryData.deliveryRemark).toBe('物品完好无损，客户已签收')
  })

  test('交付凭证照片数量验证 - 至少需要一张照片', () => {
    const validDelivery = {
      deliveryPhotos: ['photo1.jpg'],
      deliveryRemark: ''
    }

    const isValid = validDelivery.deliveryPhotos.length > 0
    expect(isValid).toBe(true)
  })

  test('交付凭证验证 - 无照片时无效', () => {
    const invalidDelivery = {
      deliveryPhotos: [],
      deliveryRemark: '没有照片'
    }

    const isValid = invalidDelivery.deliveryPhotos.length > 0
    expect(isValid).toBe(false)
  })

  test('交付完成后状态应为已交付状态', () => {
    const task = {
      id: 1001,
      type: 'delivery',
      status: 'pending',
      statusText: '待交付'
    }

    updateTaskStatus(task, 'delivery', {
      actualDeliveryTime: '2026-06-20 14:00:00',
      deliveryPhotos: ['photo1.jpg'],
      deliveryRemark: '测试交付'
    })

    expect(task.status).toBe('completed')
    expect(task.statusText).toBe('已交付')
    expect(task.deliveryPhotos).toEqual(['photo1.jpg'])
    expect(task.deliveryRemark).toBe('测试交付')
  })
})

describe('验收报告功能测试', () => {
  test('验收报告应包含完整信息', () => {
    const acceptanceData = {
      acceptanceReport: ['验收报告.pdf'],
      deviceStatusPhotos: ['photo1.jpg', 'photo2.jpg'],
      damageAssessment: [],
      acceptanceResult: '设备完好，无损坏',
      damageFee: 0,
      acceptanceRemark: '设备使用情况良好'
    }

    expect(acceptanceData.acceptanceReport.length).toBeGreaterThan(0)
    expect(acceptanceData.deviceStatusPhotos.length).toBeGreaterThan(0)
    expect(acceptanceData.acceptanceResult).toBeDefined()
    expect(typeof acceptanceData.damageFee).toBe('number')
  })

  test('验收报告验证 - 报告和照片必填', () => {
    const validAcceptance = {
      acceptanceReport: ['report.pdf'],
      deviceStatusPhotos: ['photo1.jpg'],
      acceptanceResult: 'good'
    }

    const isValid = validAcceptance.acceptanceReport.length > 0 &&
      validAcceptance.deviceStatusPhotos.length > 0 &&
      validAcceptance.acceptanceResult !== ''

    expect(isValid).toBe(true)
  })

  test('验收报告验证 - 缺少报告时无效', () => {
    const invalidAcceptance = {
      acceptanceReport: [],
      deviceStatusPhotos: ['photo1.jpg'],
      acceptanceResult: 'good'
    }

    const isValid = invalidAcceptance.acceptanceReport.length > 0 &&
      invalidAcceptance.deviceStatusPhotos.length > 0 &&
      invalidAcceptance.acceptanceResult !== ''

    expect(isValid).toBe(false)
  })

  test('验收报告验证 - 缺少照片时无效', () => {
    const invalidAcceptance = {
      acceptanceReport: ['report.pdf'],
      deviceStatusPhotos: [],
      acceptanceResult: 'good'
    }

    const isValid = invalidAcceptance.acceptanceReport.length > 0 &&
      invalidAcceptance.deviceStatusPhotos.length > 0 &&
      invalidAcceptance.acceptanceResult !== ''

    expect(isValid).toBe(false)
  })

  test('验收报告验证 - 未选择结果时无效', () => {
    const invalidAcceptance = {
      acceptanceReport: ['report.pdf'],
      deviceStatusPhotos: ['photo1.jpg'],
      acceptanceResult: ''
    }

    const isValid = invalidAcceptance.acceptanceReport.length > 0 &&
      invalidAcceptance.deviceStatusPhotos.length > 0 &&
      invalidAcceptance.acceptanceResult !== ''

    expect(isValid).toBe(false)
  })

  test('设备完好 - 损坏费用为0', () => {
    const task = {
      id: 3001,
      type: 'acceptance',
      status: 'pending',
      statusText: '待验收'
    }

    updateTaskStatus(task, 'acceptance', {
      actualAcceptanceTime: '2026-06-20 10:00:00',
      acceptanceReport: ['report.pdf'],
      deviceStatusPhotos: ['photo1.jpg'],
      acceptanceResult: '设备完好，无损坏',
      damageFee: 0
    })

    expect(task.status).toBe('completed')
    expect(task.statusText).toBe('验收通过')
    expect(task.acceptanceResult).toBe('设备完好，无损坏')
    expect(task.damageFee).toBe(0)
  })

  test('设备损坏 - 有损坏费用', () => {
    const task = {
      id: 3002,
      type: 'acceptance',
      status: 'pending',
      statusText: '待验收'
    }

    updateTaskStatus(task, 'acceptance', {
      actualAcceptanceTime: '2026-06-20 10:00:00',
      acceptanceReport: ['report.pdf'],
      deviceStatusPhotos: ['photo1.jpg'],
      damageAssessment: ['damage.pdf'],
      acceptanceResult: '设备有轻微划痕，需要维修',
      damageFee: 500
    })

    expect(task.status).toBe('completed')
    expect(task.acceptanceResult).toBe('设备有轻微划痕，需要维修')
    expect(task.damageFee).toBe(500)
  })

  test('验收结果选项映射', () => {
    const resultTextMap = {
      good: '设备完好，无损坏',
      damaged: '设备有轻微损坏',
      serious: '设备严重损坏'
    }

    expect(resultTextMap.good).toBe('设备完好，无损坏')
    expect(resultTextMap.damaged).toBe('设备有轻微损坏')
    expect(resultTextMap.serious).toBe('设备严重损坏')
  })
})

describe('报修完成功能测试', () => {
  test('报修完成应包含维修结果', () => {
    const repairData = {
      repairResult: '设备故障已排除，恢复正常',
      repairCost: 800,
      repairPhotos: ['photo1.jpg', 'photo2.jpg'],
      repairRemark: '更换了主板电容'
    }

    expect(repairData.repairResult).toBeDefined()
    expect(repairData.repairResult.length).toBeGreaterThan(0)
  })

  test('报修完成验证 - 维修结果必填', () => {
    const validRepair = {
      repairResult: '已修复',
      repairCost: 500
    }

    const isValid = validRepair.repairResult !== ''
    expect(isValid).toBe(true)
  })

  test('报修完成验证 - 无维修结果时无效', () => {
    const invalidRepair = {
      repairResult: '',
      repairCost: 500
    }

    const isValid = invalidRepair.repairResult !== ''
    expect(isValid).toBe(false)
  })

  test('维修费用可以为0', () => {
    const repairData = {
      repairResult: '已修复',
      repairCost: 0
    }

    expect(repairData.repairCost).toBe(0)
  })

  test('报修完成后状态应为已完成', () => {
    const task = {
      id: 4001,
      type: 'repair',
      status: 'pending',
      statusText: '待处理'
    }

    updateTaskStatus(task, 'repair', {
      actualRepairTime: '2026-06-20 16:00:00',
      repairResult: '设备故障已排除，恢复正常',
      repairCost: 800,
      repairPhotos: ['photo1.jpg'],
      repairRemark: '更换了零件'
    })

    expect(task.status).toBe('completed')
    expect(task.statusText).toBe('已完成')
    expect(task.repairResult).toBe('设备故障已排除，恢复正常')
    expect(task.repairCost).toBe(800)
  })

  test('维修结果选项映射', () => {
    const resultTextMap = {
      fixed: '设备故障已排除，恢复正常',
      partial: '主要问题解决，仍有小问题',
      unfixable: '设备损坏严重，需要更换'
    }

    expect(resultTextMap.fixed).toBe('设备故障已排除，恢复正常')
    expect(resultTextMap.partial).toBe('主要问题解决，仍有小问题')
    expect(resultTextMap.unfixable).toBe('设备损坏严重，需要更换')
  })

  test('报修完成后应关闭售后中状态', () => {
    const tasks = [
      {
        id: 4001,
        type: 'repair',
        status: 'processing',
        statusText: '维修中',
        customerName: 'A科技有限公司',
        itemName: '激光打印机'
      },
      {
        id: 2005,
        type: 'renting',
        status: 'processing',
        statusText: '售后中',
        customerName: 'A科技有限公司',
        itemName: '激光打印机',
        inAfterSales: true
      }
    ]

    const repairTaskIndex = tasks.findIndex(t => t.id === 4001)
    updateTaskStatus(tasks[repairTaskIndex], 'repair', {
      actualRepairTime: '2026-06-20 16:00:00',
      repairResult: '已修复'
    })

    const relatedRentingTask = tasks.find(t =>
      t.type === 'renting' &&
      t.customerName === tasks[repairTaskIndex].customerName &&
      t.itemName === tasks[repairTaskIndex].itemName &&
      t.inAfterSales
    )

    if (relatedRentingTask) {
      relatedRentingTask.inAfterSales = false
      relatedRentingTask.statusText = '租赁中'
    }

    expect(tasks[repairTaskIndex].status).toBe('completed')
    expect(relatedRentingTask.inAfterSales).toBe(false)
    expect(relatedRentingTask.statusText).toBe('租赁中')
  })
})
