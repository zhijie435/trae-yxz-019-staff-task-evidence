const tasks = [
  {
    id: 1,
    title: '处理用户投诉工单-001',
    description: '用户反馈商品破损，需要核实并安排退换货',
    status: 'pending',
    statusText: '待处理',
    priority: 'high',
    createTime: '2026-06-18 09:30:00',
    assignee: '张三'
  },
  {
    id: 2,
    title: '审核报销申请-20260618',
    description: '市场部6月出差费用报销审核',
    status: 'pending',
    statusText: '待处理',
    priority: 'medium',
    createTime: '2026-06-18 10:15:00',
    assignee: '李四'
  },
  {
    id: 3,
    title: '系统升级维护',
    description: '后台管理系统版本升级，预计耗时2小时',
    status: 'processing',
    statusText: '进行中',
    priority: 'high',
    createTime: '2026-06-19 14:00:00',
    assignee: '王五'
  },
  {
    id: 4,
    title: '新员工入职培训',
    description: '为新入职员工进行系统操作培训',
    status: 'processing',
    statusText: '进行中',
    priority: 'medium',
    createTime: '2026-06-19 09:00:00',
    assignee: '赵六'
  },
  {
    id: 5,
    title: '月度报表生成',
    description: '生成5月业务数据统计报表',
    status: 'completed',
    statusText: '已完成',
    priority: 'low',
    createTime: '2026-06-01 08:00:00',
    completeTime: '2026-06-05 16:30:00',
    assignee: '张三'
  },
  {
    id: 6,
    title: '客户回访',
    description: '对VIP客户进行季度回访',
    status: 'completed',
    statusText: '已完成',
    priority: 'medium',
    createTime: '2026-06-10 10:00:00',
    completeTime: '2026-06-15 11:20:00',
    assignee: '李四'
  },
  {
    id: 7,
    title: '旧系统数据迁移',
    description: '将旧系统历史数据迁移到新平台',
    status: 'cancelled',
    statusText: '已取消',
    priority: 'high',
    createTime: '2026-06-05 14:00:00',
    cancelReason: '新系统架构调整，无需迁移',
    assignee: '王五'
  },
  {
    id: 8,
    title: '年度预算编制',
    description: '编制下一年度部门预算',
    status: 'pending',
    statusText: '待处理',
    priority: 'high',
    createTime: '2026-06-20 08:30:00',
    assignee: '赵六'
  }
]

module.exports = tasks
