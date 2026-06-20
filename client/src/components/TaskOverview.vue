<template>
  <section class="info-card task-overview">
    <div class="card-header">
      <span class="card-icon">{{ icon }}</span>
      <h2 class="card-title">任务概况</h2>
      <span class="status-badge" :class="task?.status">
        {{ task?.statusText }}
      </span>
    </div>
    <div class="card-body">
      <h3 class="task-title">{{ task?.title }}</h3>
      <p class="task-description">{{ task?.description }}</p>
      <div class="task-meta">
        <span class="meta-item">
          <span class="meta-label">优先级：</span>
          <span class="priority-tag" :class="task?.priority">
            {{ priorityText }}
          </span>
        </span>
        <span class="meta-item">
          <span class="meta-label">创建时间：</span>
          {{ task?.createTime }}
        </span>
        <span class="meta-item">
          <span class="meta-label">负责人：</span>
          {{ task?.assignee }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { getTaskPriorityText } from '../constants/taskTypes'

const props = defineProps({
  task: {
    type: Object,
    default: null
  },
  icon: {
    type: String,
    default: '📋'
  }
})

const priorityText = computed(() => {
  if (!props.task) return ''
  return getTaskPriorityText(props.task.priority)
})
</script>

<style scoped>
.info-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9fb 0%, #fafbfc 100%);
  border-bottom: 1px solid #f0f2f5;
}

.card-icon {
  font-size: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.status-badge {
  padding: 4px 14px;
  font-size: 12px;
  border-radius: 12px;
  font-weight: 500;
}

.status-badge.pending {
  background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%);
  color: #d46b08;
}

.status-badge.processing {
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  color: #096dd9;
}

.status-badge.completed {
  background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
  color: #389e0d;
}

.status-badge.cancelled {
  background: #f5f5f5;
  color: #8c8c8c;
}

.card-body {
  padding: 20px;
}

.task-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.task-description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 16px 0;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  border-left: 3px solid #e5e7eb;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.meta-item {
  font-size: 13px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-label {
  color: #9ca3af;
}

.priority-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
  font-weight: 500;
}

.priority-tag.high {
  background: #fff1f0;
  color: #f5222d;
}

.priority-tag.medium {
  background: #fff7e6;
  color: #fa8c16;
}

.priority-tag.low {
  background: #f0f0f0;
  color: #595959;
}
</style>
