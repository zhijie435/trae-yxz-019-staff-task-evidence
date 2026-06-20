<template>
  <section class="remark-section info-card">
    <div class="card-header">
      <span class="card-icon">📝</span>
      <h2 class="card-title">{{ title }}</h2>
      <span v-if="required" class="required-tag">* 必填</span>
      <span v-else class="optional-tag">选填</span>
    </div>
    <div class="card-body">
      <textarea
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value); $emit('change', $event.target.value)"
        class="remark-textarea"
        :placeholder="placeholder"
        :rows="rows"
      ></textarea>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '备注'
  },
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入备注信息...'
  },
  rows: {
    type: Number,
    default: 4
  },
  required: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue', 'change'])
</script>

<style scoped>
.info-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9fb 0%, #fafbfc 100%);
  border-bottom: 1px solid #f0f2f5;
}

.card-icon {
  font-size: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.required-tag {
  color: #ef4444;
  font-size: 12px;
  font-weight: 500;
}

.optional-tag {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
}

.card-body {
  padding: 20px;
}

.remark-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
  box-sizing: border-box;
}

.remark-textarea:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.remark-textarea::placeholder {
  color: #9ca3af;
}
</style>
