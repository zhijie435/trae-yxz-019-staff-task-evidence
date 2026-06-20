<template>
  <div class="rental-tasks">
    <header class="page-header">
      <div class="header-content">
        <div class="header-main">
          <div class="title-section">
            <div class="page-icon">🏠</div>
            <div class="title-text">
              <h1 class="page-title">租赁任务管理</h1>
              <p class="page-subtitle">
                共 <span class="stat-number">{{ stats.all }}</span> 个任务，
                待处理 <span class="stat-pending">{{ pendingCount }}</span> 个，
                进行中 <span class="stat-processing">{{ processingCount }}</span> 个
              </p>
            </div>
          </div>
        </div>

        <div class="header-stats">
          <div class="stat-card delivery">
            <div class="stat-card-icon">🚚</div>
            <div class="stat-card-content">
              <div class="stat-card-label">交付任务</div>
              <div class="stat-card-value">{{ stats.delivery }}</div>
            </div>
          </div>
          <div class="stat-card renting">
            <div class="stat-card-icon">📦</div>
            <div class="stat-card-content">
              <div class="stat-card-label">租赁中任务</div>
              <div class="stat-card-value">{{ stats.renting }}</div>
            </div>
          </div>
          <div class="stat-card acceptance">
            <div class="stat-card-icon">✅</div>
            <div class="stat-card-content">
              <div class="stat-card-label">验收任务</div>
              <div class="stat-card-value">{{ stats.acceptance }}</div>
            </div>
          </div>
          <div class="stat-card repair">
            <div class="stat-card-icon">🔧</div>
            <div class="stat-card-content">
              <div class="stat-card-label">报修任务</div>
              <div class="stat-card-value">{{ stats.repair }}</div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="page-main">
      <RentalTaskFilterBar
        v-model="activeType"
        :stats="stats"
        @change="handleTypeChange"
      />

      <div class="task-content-wrapper">
        <div class="content-header">
          <h2 class="content-title">{{ currentTypeText }}列表</h2>
          <div class="content-meta">
            <span>当前筛选：<strong>{{ tasks.length }}</strong> 条记录</span>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <div v-else-if="tasks.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <p class="empty-text">暂无{{ currentTypeText }}任务</p>
          <p class="empty-hint">点击上方分类标签切换查看其他类型任务</p>
        </div>

        <div v-else class="task-grid">
          <RentalTaskCard
            v-for="task in tasks"
            :key="task.id"
            :task="task"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import RentalTaskFilterBar from '../components/RentalTaskFilterBar.vue'
import RentalTaskCard from '../components/RentalTaskCard.vue'
import { getRentalTasks } from '../api/rentalTask'

const activeType = ref('all')
const tasks = ref([])
const loading = ref(false)
const stats = ref({
  all: 0,
  delivery: 0,
  renting: 0,
  acceptance: 0,
  repair: 0
})

const typeTextMap = {
  all: '全部任务',
  delivery: '交付任务',
  renting: '租赁中任务',
  acceptance: '验收任务',
  repair: '报修任务'
}

const currentTypeText = computed(() => typeTextMap[activeType.value])

const pendingCount = computed(() => {
  return tasks.value.filter(t => t.status === 'pending').length
})

const processingCount = computed(() => {
  return tasks.value.filter(t => t.status === 'processing').length
})

const fetchTasks = async () => {
  loading.value = true
  try {
    const res = await getRentalTasks({ type: activeType.value })
    if (res.code === 0) {
      tasks.value = res.data.list
      stats.value = res.data.stats
    }
  } catch (error) {
    console.error('获取租赁任务列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleTypeChange = () => {
  fetchTasks()
}

onMounted(() => {
  fetchTasks()
})
</script>

<style scoped>
.rental-tasks {
  min-height: 100vh;
  background: linear-gradient(180deg, #1e3a8a 0%, #2563eb 40%, #3b82f6 60%, #f5f7fa 60%);
}

.page-header {
  padding: 40px 40px 32px;
  color: #ffffff;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.header-main {
  margin-bottom: 28px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.page-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.title-text {
  flex: 1;
}

.page-title {
  font-size: 30px;
  font-weight: 700;
  margin: 0 0 10px 0;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 14px;
  margin: 0;
  opacity: 0.92;
  line-height: 1.6;
}

.stat-number {
  font-weight: 700;
  font-size: 15px;
  padding: 1px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  margin: 0 2px;
}

.stat-pending {
  font-weight: 700;
  color: #fde68a;
  padding: 1px 6px;
  margin: 0 2px;
}

.stat-processing {
  font-weight: 700;
  color: #bfdbfe;
  padding: 1px 6px;
  margin: 0 2px;
}

.header-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.stat-card-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  flex-shrink: 0;
}

.stat-card.delivery .stat-card-icon {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.stat-card.renting .stat-card-icon {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.stat-card.acceptance .stat-card-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-card.repair .stat-card-icon {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.stat-card-content {
  flex: 1;
  min-width: 0;
}

.stat-card-label {
  font-size: 13px;
  opacity: 0.85;
  margin-bottom: 4px;
  line-height: 1.3;
}

.stat-card-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
}

.page-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px 60px;
}

.task-content-wrapper {
  margin-top: 24px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  border-bottom: 1px solid #f0f2f5;
}

.content-title {
  font-size: 17px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.content-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(180deg, #3b82f6, #2563eb);
  border-radius: 2px;
}

.content-meta {
  font-size: 13px;
  color: #6b7280;
}

.content-meta strong {
  color: #2563eb;
  font-weight: 600;
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
  font-size: 14px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: #9ca3af;
  font-size: 15px;
  margin: 0;
}

.empty-icon {
  font-size: 72px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-text {
  color: #6b7280;
  font-size: 16px;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.empty-hint {
  color: #9ca3af;
  font-size: 13px;
  margin: 0;
}

.task-grid {
  padding: 28px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
</style>
