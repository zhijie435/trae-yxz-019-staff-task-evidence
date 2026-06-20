<template>
  <section class="result-section info-card">
    <div class="card-header">
      <span class="card-icon">✅</span>
      <h2 class="card-title">{{ title }}</h2>
      <span v-if="required" class="required-tag">* 必填</span>
      <span v-else class="optional-tag">选填</span>
    </div>
    <div class="card-body">
      <div class="result-options" :class="{ 'three-col': options.length === 3 }">
        <label
          v-for="option in options"
          :key="option.value"
          class="result-option"
          :class="{ active: modelValue === option.value, [option.type || '']: true }"
        >
          <input
            type="radio"
            :value="option.value"
            :checked="modelValue === option.value"
            @change="$emit('update:modelValue', option.value); $emit('change', option.value)"
            hidden
          />
          <div class="option-icon" :class="option.type + '-icon'">
            {{ option.icon }}
          </div>
          <div class="option-content">
            <div class="option-title">{{ option.title }}</div>
            <div class="option-desc">{{ option.desc }}</div>
          </div>
          <div class="option-check" v-if="modelValue === option.value">✓</div>
        </label>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '处理结果'
  },
  modelValue: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
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

.result-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.result-options.three-col {
  grid-template-columns: repeat(3, 1fr);
}

.result-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
  position: relative;
}

.result-option:hover {
  border-color: #fdba74;
  background: #fff7ed;
}

.result-option.active {
  border-color: #f97316;
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.15);
}

.option-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.option-content {
  flex: 1;
  min-width: 0;
}

.option-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.option-desc {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.option-check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .result-options,
  .result-options.three-col {
    grid-template-columns: 1fr;
  }
}
</style>
