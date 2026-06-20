import { ref, computed } from 'vue'

export function useFileUpload(maxCount = 5) {
  const files = ref([])

  const canUploadMore = computed(() => files.value.length < maxCount)

  const readFileAsDataURL = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve({
          name: file.name,
          size: file.size,
          data: e.target.result
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileUpload = async (event) => {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) return

    const remainingSlots = maxCount - files.value.length
    const filesToProcess = Array.from(fileList).slice(0, remainingSlots)

    for (const file of filesToProcess) {
      const fileData = await readFileAsDataURL(file)
      files.value.push(fileData)
    }

    event.target.value = ''
  }

  const removeFile = (index) => {
    files.value.splice(index, 1)
  }

  const clearFiles = () => {
    files.value = []
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return {
    files,
    canUploadMore,
    handleFileUpload,
    removeFile,
    clearFiles,
    formatFileSize
  }
}
