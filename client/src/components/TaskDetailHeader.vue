<template>
  <header class="page-header" :style="{ background: gradient }">
    <div class="header-content">
      <div class="back-btn" @click="$emit('back')">
        <span class="back-icon">←</span>
        <span>返回列表</span>
      </div>
      <div class="header-title">
        <h1 class="page-title">{{ title }}</h1>
        <p class="page-subtitle">
          任务编号：<span class="task-id">#{{ taskId }}</span>
          <span v-if="taskType" class="task-type-tag" :style="{ background: 'rgba(255,255,255,0.2)' }">{{ taskType }}</span>
        </p>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  taskId: {
    type: [String, Number],
    default: ''
  },
  taskType: {
    type: String,
    default: ''
  },
  gradient: {
    type: String,
    default: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)'
  }
})

defineEmits(['back'])
</script>

<style scoped>
.page-header {
  color: #ffffff;
  padding: 24px 40px 32px;
}

.header-content {
  max-width: 900px;
  margin: 0 auto;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  margin-bottom: 16px;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.back-icon {
  font-size: 16px;
}

.header-title {
  text-align: center;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.task-id {
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
  font-weight: 600;
}

.task-type-tag {
  padding: 2px 10px;
  font-size: 12px;
  border-radius: 10px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .page-header {
    padding: 16px 20px 24px;
  }

  .page-title {
    font-size: 22px;
  }
}
</style>
