import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function usePhotoUpload(maxCount = 9) {
  const photos = ref([])

  const canUploadMore = computed(() => photos.value.length < maxCount)

  const handlePhotoUpload = (event) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const remainingSlots = maxCount - photos.value.length
    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    filesToProcess.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        photos.value.push(e.target.result)
      }
      reader.readAsDataURL(file)
    })

    event.target.value = ''
  }

  const removePhoto = (index) => {
    photos.value.splice(index, 1)
  }

  const clearPhotos = () => {
    photos.value = []
  }

  return {
    photos,
    canUploadMore,
    handlePhotoUpload,
    removePhoto,
    clearPhotos
  }
}
