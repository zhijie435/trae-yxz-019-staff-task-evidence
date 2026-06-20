<template>
  <div class="file-uploader">
    <div class="file-list">
      <div
        v-for="(file, index) in modelValue"
        :key="index"
        class="file-item"
        :class="{ completed: readonly }"
      >
        <div class="file-icon">📑</div>
        <div class="file-info">
          <div class="file-name">{{ file.name }}</div>
          <div class="file-size">{{ formatFileSize(file.size) }}</div>
        </div>
        <button
          v-if="!readonly"
          class="file-delete"
          @click="handleRemove(index)"
        >
          <span>×</span>
        </button>
      </div>
    </div>
    <label
      v-if="!readonly && canUploadMore"
      class="file-upload-btn"
    >
      <input
        type="file"
        :accept="accept"
        multiple
        @change="handleUpload"
        hidden
      />
      <div class="upload-icon">📤</div>
      <div class="upload-text">{{ buttonText || '上传文件' }}</div>
      <div class="upload-hint">支持{{ acceptText }}，最多{{ maxCount }}个</div>
    </label>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  maxCount: {
    type: Number,
    default: 5
  },
  readonly: {
    type: Boolean,
    default: false
  },
  accept: {
    type: String,
    default: '.pdf,.doc,.docx,image/*'
  },
  buttonText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const canUploadMore = computed(() => props.modelValue.length < props.maxCount)

const acceptText = computed(() => {
  const types = props.accept.split(',').map(t => {
    if (t === '.pdf') return 'PDF'
    if (t === '.doc' || t === '.docx') return 'Word'
    if (t === '.xls' || t === '.xlsx') return 'Excel'
    if (t === 'image/*') return '图片'
    return t.replace('.', '').toUpperCase()
  })
  return [...new Set(types)].join('/')
})

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

const handleUpload = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  const remainingSlots = props.maxCount - props.modelValue.length
  const filesToProcess = Array.from(files).slice(0, remainingSlots)
  const newFiles = [...props.modelValue]

  for (const file of filesToProcess) {
    const fileData = await readFileAsDataURL(file)
    newFiles.push(fileData)
  }

  emit('update:modelValue', newFiles)
  emit('change', newFiles)
  event.target.value = ''
}

const handleRemove = (index) => {
  const newFiles = [...props.modelValue]
  newFiles.splice(index, 1)
  emit('update:modelValue', newFiles)
  emit('change', newFiles)
}

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<style scoped>
.file-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #f0f1f3;
  position: relative;
}

.file-item.completed {
  cursor: default;
}

.file-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  color: #111827;
  font-weight: 500;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: #9ca3af;
}

.file-delete {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: #fef2f2;
  color: #ef4444;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.file-delete:hover {
  background: #fee2e2;
  transform: scale(1.1);
}

.file-upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafafa;
}

.file-upload-btn:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 12px;
  color: #9ca3af;
  opacity: 0.8;
}
</style>
