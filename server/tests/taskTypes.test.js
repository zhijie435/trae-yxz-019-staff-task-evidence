const {
  TASK_TYPES,
  TASK_PRIORITIES,
  OPERATION_LOG_TYPES,
  getTaskTypeConfig,
  getTaskTypeText,
  getTaskStatusConfig,
  getTaskStatusText,
  getTaskPriorityText,
  getOperationLogConfig
} = require('../constants/taskTypes')

describe('任务类型常量测试', () => {
  describe('TASK_TYPES', () => {
    test('应包含所有任务类型', () => {
      expect(TASK_TYPES).toHaveProperty('delivery')
      expect(TASK_TYPES).toHaveProperty('renting')
      expect(TASK_TYPES).toHaveProperty('acceptance')
      expect(TASK_TYPES).toHaveProperty('repair')
      expect(TASK_TYPES).toHaveProperty('depositRefund')
    })

    test('每个任务类型应有必要字段', () => {
      Object.values(TASK_TYPES).forEach(typeConfig => {
        expect(typeConfig).toHaveProperty('type')
        expect(typeConfig).toHaveProperty('typeText')
        expect(typeConfig).toHaveProperty('statusMap')
        expect(typeConfig).toHaveProperty('completedStatus')
        expect(typeConfig).toHaveProperty('completedStatusText')
        expect(typeConfig).toHaveProperty('actualTimeField')
        expect(typeConfig).toHaveProperty('idPrefix')
        expect(typeConfig).toHaveProperty('assignee')
      })
    })

    test('交付任务配置应配置正确', () => {
      const delivery = TASK_TYPES.delivery
      expect(delivery.type).toBe('delivery')
      expect(delivery.typeText).toBe('交付任务')
      expect(delivery.completedStatus).toBe('completed')
      expect(delivery.completedStatusText).toBe('已交付')
      expect(delivery.actualTimeField).toBe('actualDeliveryTime')
      expect(delivery.idPrefix).toBe(1000)
      expect(delivery.nextTaskType).toBe('renting')
      expect(delivery.assignee).toBe('李送货')
    })

    test('验收任务配置应正确', () => {
      const acceptance = TASK_TYPES.acceptance
      expect(acceptance.type).toBe('acceptance')
      expect(acceptance.typeText).toBe('验收任务')
      expect(acceptance.completedStatus).toBe('completed')
      expect(acceptance.completedStatusText).toBe('验收通过')
      expect(acceptance.actualTimeField).toBe('actualAcceptanceTime')
      expect(acceptance.idPrefix).toBe(3000)
      expect(acceptance.nextTaskType).toBe('depositRefund')
    })

    test('报修任务配置应正确', () => {
      const repair = TASK_TYPES.repair
      expect(repair.type).toBe('repair')
      expect(repair.typeText).toBe('报修任务')
      expect(repair.completedStatus).toBe('completed')
      expect(repair.completedStatusText).toBe('已完成')
      expect(repair.actualTimeField).toBe('actualRepairTime')
      expect(repair.idPrefix).toBe(4000)
      expect(repair.nextTaskType).toBeNull()
    })
  })

  describe('getTaskTypeConfig', () => {
    test('应返回正确的任务类型配置', () => {
      const config = getTaskTypeConfig('delivery')
      expect(config).toEqual(TASK_TYPES.delivery)
    })

    test('不存在的任务类型应返回 null', () => {
      const config = getTaskTypeConfig('unknown')
      expect(config).toBeNull()
    })
  })

  describe('getTaskTypeText', () => {
    test('应返回正确的任务类型文本', () => {
      expect(getTaskTypeText('delivery')).toBe('交付任务')
      expect(getTaskTypeText('renting')).toBe('租赁中任务')
      expect(getTaskTypeText('acceptance')).toBe('验收任务')
      expect(getTaskTypeText('repair')).toBe('报修任务')
      expect(getTaskTypeText('depositRefund')).toBe('押金退还任务')
    })

    test('不存在的任务类型应返回"未知类型"', () => {
      expect(getTaskTypeText('unknown')).toBe('未知类型')
    })
  })

  describe('getTaskStatusConfig', () => {
    test('应返回正确的状态配置', () => {
      const config = getTaskStatusConfig('delivery', 'pending')
      expect(config).toEqual({ status: 'pending', statusText: '待交付' })
    })

    test('不存在的任务类型应返回 null', () => {
      const config = getTaskStatusConfig('unknown', 'pending')
      expect(config).toBeNull()
    })

    test('不存在的状态应返回 null', () => {
      const config = getTaskStatusConfig('delivery', 'unknown')
      expect(config).toBeNull()
    })
  })

  describe('getTaskStatusText', () => {
    test('应返回正确的状态文本', () => {
      expect(getTaskStatusText('delivery', 'pending')).toBe('待交付')
      expect(getTaskStatusText('delivery', 'processing')).toBe('配送中')
      expect(getTaskStatusText('delivery', 'completed')).toBe('已交付')
    })

    test('不存在的状态应返回"未知状态"', () => {
      expect(getTaskStatusText('delivery', 'unknown')).toBe('未知状态')
    })
  })

  describe('getTaskPriorityText', () => {
    test('应返回正确的优先级文本', () => {
      expect(getTaskPriorityText('high')).toBe('高')
      expect(getTaskPriorityText('medium')).toBe('中')
      expect(getTaskPriorityText('low')).toBe('低')
    })

    test('不存在的优先级应返回"未知优先级"', () => {
      expect(getTaskPriorityText('unknown')).toBe('未知优先级')
    })
  })

  describe('getOperationLogConfig', () => {
    test('应返回正确的操作日志配置', () => {
      const config = getOperationLogConfig('delivery')
      expect(config).toEqual(OPERATION_LOG_TYPES.delivery)
    })

    test('不存在的任务类型应返回 null', () => {
      const config = getOperationLogConfig('unknown')
      expect(config).toBeNull()
    })

    test('交付任务日志配置应正确', () => {
      const config = getOperationLogConfig('delivery')
      expect(config.type).toBe('delivery')
      expect(config.title).toBe('交付完成')
      expect(config.desc).toBe('物品已成功交付给客户')
    })

    test('验收任务日志配置应正确', () => {
      const config = getOperationLogConfig('acceptance')
      expect(config.type).toBe('acceptance')
      expect(config.title).toBe('验收完成')
      expect(config.descField).toBe('acceptanceResult')
      expect(config.defaultDesc).toBe('设备验收通过')
    })

    test('报修任务日志配置应正确', () => {
      const config = getOperationLogConfig('repair')
      expect(config.type).toBe('repair')
      expect(config.title).toBe('维修完成')
      expect(config.descField).toBe('repairResult')
      expect(config.defaultDesc).toBe('设备已维修完成')
    })
  })
})
