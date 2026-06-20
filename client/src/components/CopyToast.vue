<template>
  <transition name="toast">
    <div v-if="modelValue" class="copy-toast">
      <span class="toast-icon">📋</span>
      <span>{{ message }}</span>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: '号码已复制到剪贴板'
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.copy-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 14px;
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.toast-icon {
  font-size: 18px;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}
</style>
