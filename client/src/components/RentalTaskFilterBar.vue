<template>
  <div class="rental-filter-bar">
    <div class="filter-tabs">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="filter-tab"
        :class="{ active: activeTab === tab.key }"
        @click="handleTabClick(tab.key)"
      >
        <div class="tab-icon" :class="tab.key">
          <span class="icon-text">{{ tab.icon }}</span>
        </div>
        <div class="tab-content">
          <span class="tab-label">{{ tab.label }}</span>
          <span class="tab-count" :class="tab.key">{{ stats[tab.key] || 0 }}</span>
        </div>
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
      delivery: 0,
      renting: 0,
      acceptance: 0,
      depositRefund: 0,
      repair: 0
    })
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const tabs = [
  { key: 'all', label: '全部任务', icon: '📋' },
  { key: 'delivery', label: '交付任务', icon: '🚚' },
  { key: 'renting', label: '租赁中任务', icon: '📦' },
  { key: 'acceptance', label: '验收任务', icon: '✅' },
  { key: 'depositRefund', label: '押金退还', icon: '💰' },
  { key: 'repair', label: '报修任务', icon: '🔧' }
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
.rental-filter-bar {
  background: #ffffff;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #ebeef5;
}

.filter-tabs {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fafbfc;
  border: 2px solid transparent;
  overflow: hidden;
}

.filter-tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #3b82f6, #2563eb);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.filter-tab:hover {
  background: #f0f5ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.filter-tab.active {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #93c5fd;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
}

.filter-tab.active::before {
  transform: scaleY(1);
}

.tab-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
}

.tab-icon .icon-text {
  font-size: 22px;
  line-height: 1;
}

.filter-tab:hover .tab-icon,
.filter-tab.active .tab-icon {
  transform: scale(1.08);
}

.tab-icon.all {
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
}

.filter-tab.active .tab-icon.all {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.tab-icon.delivery {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.filter-tab.active .tab-icon.delivery {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.tab-icon.renting {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
}

.filter-tab.active .tab-icon.renting {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.tab-icon.acceptance {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.filter-tab.active .tab-icon.acceptance {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.tab-icon.depositRefund {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.filter-tab.active .tab-icon.depositRefund {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.tab-icon.repair {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.filter-tab.active .tab-icon.repair {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.filter-tab.active .tab-icon .icon-text {
  filter: brightness(0) invert(1);
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.tab-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  line-height: 1.3;
  transition: color 0.2s ease;
}

.filter-tab:hover .tab-label {
  color: #2563eb;
}

.filter-tab.active .tab-label {
  color: #1e40af;
  font-weight: 600;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 22px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 600;
  line-height: 22px;
  border-radius: 11px;
  background: #e5e7eb;
  color: #6b7280;
  transition: all 0.3s ease;
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
  width: fit-content;
}

.filter-tab:hover .tab-count {
  background: #dbeafe;
  color: #2563eb;
}

.filter-tab.active .tab-count {
  background: #ffffff;
  color: #2563eb;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.tab-count.all {
  background: #ede9fe;
  color: #7c3aed;
}

.filter-tab.active .tab-count.all {
  background: #ffffff;
  color: #7c3aed;
}

.tab-count.delivery {
  background: #dbeafe;
  color: #2563eb;
}

.filter-tab.active .tab-count.delivery {
  background: #ffffff;
  color: #2563eb;
}

.tab-count.renting {
  background: #dcfce7;
  color: #16a34a;
}

.filter-tab.active .tab-count.renting {
  background: #ffffff;
  color: #16a34a;
}

.tab-count.acceptance {
  background: #fef3c7;
  color: #d97706;
}

.filter-tab.active .tab-count.acceptance {
  background: #ffffff;
  color: #d97706;
}

.tab-count.depositRefund {
  background: #d1fae5;
  color: #059669;
}

.filter-tab.active .tab-count.depositRefund {
  background: #ffffff;
  color: #059669;
}

.tab-count.repair {
  background: #fee2e2;
  color: #dc2626;
}

.filter-tab.active .tab-count.repair {
  background: #ffffff;
  color: #dc2626;
}
</style>
