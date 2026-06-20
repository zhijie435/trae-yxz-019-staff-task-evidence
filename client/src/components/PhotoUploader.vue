<template>
  <div class="photo-uploader">
    <div class="photo-grid">
      <div
        v-for="(photo, index) in modelValue"
        :key="index"
        class="photo-item"
      >
        <img :src="photo" alt="照片" class="photo-preview" />
        <button
          v-if="!readonly"
          class="photo-delete"
          @click="handleRemove(index)"
        >
          <span>×</span>
        </button>
      </div>
      <label
        v-if="!readonly && canUploadMore"
        class="photo-upload-btn"
        :class="{ 'compact': compact }"
      >
        <input
          type="file"
          accept="image/*"
          multiple
          @change="handleUpload"
          hidden
        />
        <div class="upload-icon">📸</div>
        <div v-if="!compact" class="upload-text">上传照片</div>
        <div v-if="!compact" class="upload-hint">最多{{ maxCount }}张</div>
      </label>
    </div>
    <div v-if="tips && tips.length > 0" class="photo-tips">
      <p>📌 请拍摄清晰的照片，包括：</p>
      <ul>
        <li v-for="(tip, index) in tips" :key="index">{{ tip }}</li>
      </ul>
    </div>
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
    default: 9
  },
  readonly: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  },
  tips: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const canUploadMore = computed(() => props.modelValue.length < props.maxCount)

const handleUpload = (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  const remainingSlots = props.maxCount - props.modelValue.length
  const filesToProcess = Array.from(files).slice(0, remainingSlots)
  const newPhotos = [...props.modelValue]

  filesToProcess.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      newPhotos.push(e.target.result)
      if (newPhotos.length === props.modelValue.length + filesToProcess.length) {
        emit('update:modelValue', newPhotos)
        emit('change', newPhotos)
      }
    }
    reader.readAsDataURL(file)
  })

  event.target.value = ''
}

const handleRemove = (index) => {
  const newPhotos = [...props.modelValue]
  newPhotos.splice(index, 1)
  emit('update:modelValue', newPhotos)
  emit('change', newPhotos)
}
</script>

<style scoped>
.photo-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
}

.photo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-delete {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.9);
  color: #ffffff;
  border: none;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.photo-delete:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.photo-upload-btn {
  aspect-ratio: 1;
  border-radius: 8px;
  border: 2px dashed #d1d5db;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 4px;
}

.photo-upload-btn.compact {
  gap: 2px;
}

.photo-upload-btn:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-icon {
  font-size: 28px;
}

.photo-upload-btn.compact .upload-icon {
  font-size: 24px;
}

.upload-text {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.photo-upload-btn.compact .upload-text {
  font-size: 12px;
}

.upload-hint {
  font-size: 11px;
  color: #9ca3af;
}

.photo-tips {
  padding: 12px 14px;
  background: #f0fdf4;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
}

.photo-tips p {
  margin: 0 0 6px 0;
  font-size: 13px;
  font-weight: 500;
  color: #166534;
}

.photo-tips ul {
  margin: 0;
  padding-left: 20px;
}

.photo-tips li {
  font-size: 12px;
  color: #15803d;
  line-height: 1.8;
}

@media (max-width: 640px) {
  .photo-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
