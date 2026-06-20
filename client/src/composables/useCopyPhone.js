import { ref } from 'vue'

export function useCopyPhone() {
  const showCopyTip = ref(false)

  const copyPhone = (phoneNumber) => {
    if (!phoneNumber) return

    navigator.clipboard.writeText(phoneNumber).then(() => {
      showTip()
    }).catch(() => {
      const input = document.createElement('input')
      input.value = phoneNumber
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      showTip()
    })
  }

  const showTip = () => {
    showCopyTip.value = true
    setTimeout(() => {
      showCopyTip.value = false
    }, 2000)
  }

  return {
    showCopyTip,
    copyPhone
  }
}
