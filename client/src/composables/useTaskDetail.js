import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTaskPriorityText, getTaskTypeConfig } from '../constants/taskTypes'

export function useTaskDetail(fetchApi, backType) {
  const route = useRoute()
  const router = useRouter()

  const taskId = computed(() => route.params.id)
  const task = ref(null)
  const loading = ref(true)
  const submitting = ref(false)
  const showSuccessModal = ref(false)

  const priorityText = computed(() => {
    if (!task.value) return ''
    return getTaskPriorityText(task.value.priority)
  })

  const typeConfig = computed(() => {
    if (!task.value) return null
    return getTaskTypeConfig(task.value.type)
  })

  const fetchTaskDetail = async () => {
    loading.value = true
    try {
      const res = await fetchApi(taskId.value)
      if (res.code === 0) {
        task.value = res.data
      }
    } catch (error) {
      console.error('获取任务详情失败:', error)
    } finally {
      loading.value = false
    }
  }

  const goBack = () => {
    const type = backType || task.value?.type || 'all'
    router.push(`/rental-tasks?type=${type}`)
  }

  const closeSuccessModal = () => {
    showSuccessModal.value = false
  }

  const openMap = (address) => {
    if (address) {
      window.open(`https://map.baidu.com/search/${encodeURIComponent(address)}`, '_blank')
    }
  }

  return {
    taskId,
    task,
    loading,
    submitting,
    showSuccessModal,
    priorityText,
    typeConfig,
    fetchTaskDetail,
    goBack,
    closeSuccessModal,
    openMap
  }
}
