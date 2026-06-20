<template>
  <div class="my-tasks">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">我的任务</h1>
        <p class="page-subtitle">共 {{ stats.all }} 个任务，待处理 {{ stats.pending }} 个</p>
      </div>
    </header>

    <main class="page-main">
      <TaskFilterBar
        v-model="activeStatus"
        :stats="stats"
        @change="handleStatusChange"
      />

      <div class="task-list-wrapper">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <div v-else-if="tasks.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <p class="empty-text">暂无{{ currentStatusText }}任务</p>
        </div>

        <div v-else class="task-list">
          <TaskItem
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
import TaskFilterBar from '../components/TaskFilterBar.vue'
import TaskItem from '../components/TaskItem.vue'
import { getTasks } from '../api/task'

const activeStatus = ref('all')
const tasks = ref([])
const loading = ref(false)
const stats = ref({
  all: 0,
  pending: 0,
  processing: 0,
  completed: 0,
  cancelled: 0
})

const statusTextMap = {
  all: '',
  pending: '待处理',
  processing: '进行中',
  completed: '已完成',
  cancelled: '已取消'
}

const currentStatusText = computed(() => statusTextMap[activeStatus.value])

const fetchTasks = async () => {
  loading.value = true
  try {
    const res = await getTasks(activeStatus.value)
    if (res.code === 0) {
      tasks.value = res.data.list
      stats.value = res.data.stats
    }
  } catch (error) {
    console.error('获取任务列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleStatusChange = (status) => {
  fetchTasks()
}

onMounted(() => {
  fetchTasks()
})
</script>

<style scoped>
.my-tasks {
  min-height: 100vh;
  background: linear-gradient(180deg, #409eff 0%, #f5f7fa 200px);
}

.page-header {
  padding: 40px 40px 32px;
  color: #ffffff;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.page-subtitle {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
}

.page-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px 40px;
}

.task-list-wrapper {
  margin-top: 16px;
  min-height: 400px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f0f2f5;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  color: #909399;
  font-size: 15px;
  margin: 0;
}

.task-list {
  margin-top: 16px;
}
</style>
