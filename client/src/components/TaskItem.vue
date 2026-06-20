<template>
  <div class="task-item">
    <div class="task-header">
      <div class="task-title-row">
        <span
          class="priority-tag"
          :class="task.priority"
        >{{ priorityText }}</span>
        <h3 class="task-title">{{ task.title }}</h3>
      </div>
      <span
        class="status-tag"
        :class="task.status"
      >{{ task.statusText }}</span>
    </div>
    <p class="task-desc">{{ task.description }}</p>
    <div class="task-footer">
      <div class="task-meta">
        <span class="meta-item">
          <span class="meta-icon">👤</span>
          <span>{{ task.assignee }}</span>
        </span>
        <span class="meta-item">
          <span class="meta-icon">📅</span>
          <span>{{ task.createTime }}</span>
        </span>
        <span v-if="task.completeTime" class="meta-item">
          <span class="meta-icon">✅</span>
          <span>{{ task.completeTime }}</span>
        </span>
      </div>
      <div class="task-actions">
        <button v-if="task.status === 'pending'" class="btn btn-primary">
          开始处理
        </button>
        <button v-if="task.status === 'processing'" class="btn btn-success">
          完成
        </button>
        <button v-if="task.status === 'pending' || task.status === 'processing'" class="btn btn-danger">
          取消
        </button>
        <button class="btn btn-default">查看详情</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const priorityText = computed(() => {
  const map = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return map[props.task.priority] || '普通'
})
</script>

<style scoped>
.task-item {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.task-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #e4e7ed;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.task-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.priority-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
  font-weight: 500;
}

.priority-tag.high {
  background: #fef0f0;
  color: #f56c6c;
}

.priority-tag.medium {
  background: #fdf6ec;
  color: #e6a23c;
}

.priority-tag.low {
  background: #f4f4f5;
  color: #909399;
}

.task-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0;
  line-height: 1.5;
}

.status-tag {
  display: inline-block;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 12px;
  font-weight: 500;
}

.status-tag.pending {
  background: #fdf6ec;
  color: #e6a23c;
}

.status-tag.processing {
  background: #ecf5ff;
  color: #409eff;
}

.status-tag.completed {
  background: #f0f9eb;
  color: #67c23a;
}

.status-tag.cancelled {
  background: #f4f4f5;
  color: #909399;
}

.task-desc {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f2f5;
}

.task-meta {
  display: flex;
  gap: 24px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
}

.meta-icon {
  font-size: 14px;
}

.task-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 6px 16px;
  font-size: 13px;
  border-radius: 4px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.5;
}

.btn-primary {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

.btn-primary:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}

.btn-success {
  background: #67c23a;
  color: #fff;
  border-color: #67c23a;
}

.btn-success:hover {
  background: #85ce61;
  border-color: #85ce61;
}

.btn-danger {
  background: #fff;
  color: #f56c6c;
  border-color: #fbc4c4;
}

.btn-danger:hover {
  background: #fef0f0;
  color: #f56c6c;
  border-color: #f56c6c;
}

.btn-default {
  background: #fff;
  color: #606266;
  border-color: #dcdfe6;
}

.btn-default:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background: #ecf5ff;
}
</style>
