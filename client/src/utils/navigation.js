export function generateMapUrl(address) {
  if (!address || typeof address !== 'string' || address.trim() === '') {
    return ''
  }
  const encodedAddress = encodeURIComponent(address.trim())
  return `https://map.baidu.com/search/${encodedAddress}`
}

export function openMap(address) {
  const url = generateMapUrl(address)
  if (!url) {
    return false
  }
  window.open(url, '_blank')
  return true
}

export function generateNavigationUrl(address) {
  if (!address || typeof address !== 'string' || address.trim() === '') {
    return ''
  }
  const encodedAddress = encodeURIComponent(address.trim())
  return `https://map.baidu.com/dir/?destination=${encodedAddress}`
}

export function openNavigation(address) {
  const url = generateNavigationUrl(address)
  if (!url) {
    return false
  }
  window.open(url, '_blank')
  return true
}

export function formatAddress(address) {
  if (!address || typeof address !== 'string') {
    return ''
  }
  return address.trim()
}

export function validateAddress(address) {
  if (!address || typeof address !== 'string') {
    return false
  }
  const trimmed = address.trim()
  return trimmed.length > 0 && trimmed.length <= 200
}
