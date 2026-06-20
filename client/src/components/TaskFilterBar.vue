<template>
  <div class="filter-bar">
    <div class="filter-tabs">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="filter-tab"
        :class="{ active: activeTab === tab.key }"
        @click="handleTabClick(tab.key)"
      >
        <span class="tab-label">{{ tab.label }}</span>
        <span class="tab-count" :class="tab.key">{{ stats[tab.key] || 0 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'all'
  },
  stats: {
    type: Object,
    default: () => ({
      all: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      cancelled: 0
    })
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'processing', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' }
]

const activeTab = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newVal) => {
    activeTab.value = newVal
  }
)

const handleTabClick = (key) => {
  if (activeTab.value === key) return
  activeTab.value = key
  emit('update:modelValue', key)
  emit('change', key)
}
</script>

<style scoped>
.filter-bar {
  background: #ffffff;
  border-radius: 8px;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filter-tabs {
  display: flex;
  align-items: center;
  gap: 32px;
  height: 56px;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 0;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  color: #606266;
  font-size: 14px;
}

.filter-tab::after {
  content: '';
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #409eff, #66b1ff);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.filter-tab:hover {
  color: #409eff;
}

.filter-tab.active {
  color: #409eff;
  font-weight: 500;
}

.filter-tab.active::after {
  width: 100%;
}

.tab-label {
  line-height: 1;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 12px;
  line-height: 20px;
  border-radius: 10px;
  background: #f0f2f5;
  color: #909399;
  transition: all 0.2s ease;
}

.filter-tab.active .tab-count {
  background: #ecf5ff;
  color: #409eff;
}

.tab-count.pending {
  background: #fdf6ec;
  color: #e6a23c;
}

.filter-tab.active .tab-count.pending {
  background: #fff7e6;
  color: #e6a23c;
}

.tab-count.processing {
  background: #ecf5ff;
  color: #409eff;
}

.filter-tab.active .tab-count.processing {
  background: #d9ecff;
  color: #409eff;
}

.tab-count.completed {
  background: #f0f9eb;
  color: #67c23a;
}

.filter-tab.active .tab-count.completed {
  background: #e1f3d8;
  color: #67c23a;
}

.tab-count.cancelled {
  background: #fef0f0;
  color: #f56c6c;
}

.filter-tab.active .tab-count.cancelled {
  background: #fde2e2;
  color: #f56c6c;
}
</style>
