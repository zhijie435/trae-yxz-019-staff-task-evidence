import { describe, test, expect, beforeEach, vi } from 'vitest'
import {
  generateMapUrl,
  openMap,
  generateNavigationUrl,
  openNavigation,
  formatAddress,
  validateAddress
} from '../src/utils/navigation.js'

describe('一键导航功能测试', () => {
  describe('generateMapUrl - 生成地图URL', () => {
    test('应正确生成百度地图搜索URL', () => {
      const address = '北京市朝阳区科技园A座1001室'
      const url = generateMapUrl(address)
      const expected = `https://map.baidu.com/search/${encodeURIComponent(address)}`
      expect(url).toBe(expected)
    })

    test('空地址应返回空字符串', () => {
      expect(generateMapUrl('')).toBe('')
      expect(generateMapUrl(null)).toBe('')
      expect(generateMapUrl(undefined)).toBe('')
    })

    test('空白地址应返回空字符串', () => {
      expect(generateMapUrl('   ')).toBe('')
      expect(generateMapUrl('\t\n')).toBe('')
    })

    test('非字符串类型应返回空字符串', () => {
      expect(generateMapUrl(123)).toBe('')
      expect(generateMapUrl({})).toBe('')
      expect(generateMapUrl([])).toBe('')
    })

    test('应自动去除地址首尾空格', () => {
      const address = '  北京市朝阳区科技园  '
      const url = generateMapUrl(address)
      const expected = `https://map.baidu.com/search/${encodeURIComponent('北京市朝阳区科技园')}`
      expect(url).toBe(expected)
    })

    test('应正确编码特殊字符', () => {
      const address = '北京市&朝阳区#科技园@A座'
      const url = generateMapUrl(address)
      expect(url).toContain(encodeURIComponent('&'))
      expect(url).toContain(encodeURIComponent('#'))
      expect(url).toContain(encodeURIComponent('@'))
    })

    test('中文地址应正确编码', () => {
      const address = '北京市朝阳区'
      const url = generateMapUrl(address)
      expect(url).toBe(`https://map.baidu.com/search/%E5%8C%97%E4%BA%AC%E5%B8%82%E6%9C%9D%E9%98%B3%E5%8C%BA`)
    })
  })

  describe('openMap - 打开地图', () => {
    beforeEach(() => {
      window.open = vi.fn()
    })

    test('有效地址应调用 window.open 并返回 true', () => {
      const address = '北京市朝阳区科技园A座'
      const result = openMap(address)
      expect(window.open).toHaveBeenCalledTimes(1)
      expect(window.open).toHaveBeenCalledWith(
        `https://map.baidu.com/search/${encodeURIComponent(address)}`,
        '_blank'
      )
      expect(result).toBe(true)
    })

    test('无效地址不应调用 window.open 并返回 false', () => {
      const result = openMap('')
      expect(window.open).not.toHaveBeenCalled()
      expect(result).toBe(false)
    })

    test('null 地址不应调用 window.open', () => {
      const result = openMap(null)
      expect(window.open).not.toHaveBeenCalled()
      expect(result).toBe(false)
    })
  })

  describe('generateNavigationUrl - 生成导航URL', () => {
    test('应正确生成百度地图导航URL', () => {
      const address = '上海市浦东新区张江高科技园区'
      const url = generateNavigationUrl(address)
      const expected = `https://map.baidu.com/dir/?destination=${encodeURIComponent(address)}`
      expect(url).toBe(expected)
    })

    test('空地址应返回空字符串', () => {
      expect(generateNavigationUrl('')).toBe('')
      expect(generateNavigationUrl(null)).toBe('')
      expect(generateNavigationUrl(undefined)).toBe('')
    })

    test('空白地址应返回空字符串', () => {
      expect(generateNavigationUrl('   ')).toBe('')
    })

    test('应自动去除地址首尾空格', () => {
      const address = '  上海市浦东新区  '
      const url = generateNavigationUrl(address)
      expect(url).toBe(
        `https://map.baidu.com/dir/?destination=${encodeURIComponent('上海市浦东新区')}`
      )
    })
  })

  describe('openNavigation - 打开导航', () => {
    beforeEach(() => {
      window.open = vi.fn()
    })

    test('有效地址应调用 window.open 打开导航并返回 true', () => {
      const address = '广州市天河区珠江新城'
      const result = openNavigation(address)
      expect(window.open).toHaveBeenCalledTimes(1)
      expect(window.open).toHaveBeenCalledWith(
        `https://map.baidu.com/dir/?destination=${encodeURIComponent(address)}`,
        '_blank'
      )
      expect(result).toBe(true)
    })

    test('无效地址不应调用 window.open 并返回 false', () => {
      const result = openNavigation('')
      expect(window.open).not.toHaveBeenCalled()
      expect(result).toBe(false)
    })
  })

  describe('formatAddress - 格式化地址', () => {
    test('应去除首尾空格', () => {
      expect(formatAddress('  北京市朝阳区  ')).toBe('北京市朝阳区')
    })

    test('空值应返回空字符串', () => {
      expect(formatAddress('')).toBe('')
      expect(formatAddress(null)).toBe('')
      expect(formatAddress(undefined)).toBe('')
    })

    test('非字符串应返回空字符串', () => {
      expect(formatAddress(123)).toBe('')
      expect(formatAddress({})).toBe('')
    })

    test('正常地址应保持不变', () => {
      const address = '北京市朝阳区科技园A座1001室'
      expect(formatAddress(address)).toBe(address)
    })
  })

  describe('validateAddress - 验证地址', () => {
    test('有效地址应返回 true', () => {
      expect(validateAddress('北京市朝阳区科技园A座1001室')).toBe(true)
    })

    test('空值应返回 false', () => {
      expect(validateAddress('')).toBe(false)
      expect(validateAddress(null)).toBe(false)
      expect(validateAddress(undefined)).toBe(false)
    })

    test('空白字符应返回 false', () => {
      expect(validateAddress('   ')).toBe(false)
      expect(validateAddress('\t\n')).toBe(false)
    })

    test('非字符串类型应返回 false', () => {
      expect(validateAddress(123)).toBe(false)
      expect(validateAddress({})).toBe(false)
      expect(validateAddress([])).toBe(false)
    })

    test('超长地址应返回 false', () => {
      const longAddress = '北京市朝阳区'.repeat(50)
      expect(validateAddress(longAddress)).toBe(false)
    })

    test('200字符以内的地址应返回 true', () => {
      const address = '北京市朝阳区'.repeat(20)
      expect(address.length).toBeLessThanOrEqual(200)
      expect(validateAddress(address)).toBe(true)
    })

    test('正好200字符的地址应返回 true', () => {
      const address = 'A'.repeat(200)
      expect(validateAddress(address)).toBe(true)
    })

    test('201字符的地址应返回 false', () => {
      const address = 'A'.repeat(201)
      expect(validateAddress(address)).toBe(false)
    })
  })

  describe('一键导航集成测试', () => {
    beforeEach(() => {
      window.open = vi.fn()
    })

    test('完整的一键导航流程', () => {
      const address = '北京市朝阳区科技园A座1001室'

      expect(validateAddress(address)).toBe(true)

      const formattedAddress = formatAddress(address)
      expect(formattedAddress).toBe('北京市朝阳区科技园A座1001室')

      const mapUrl = generateMapUrl(address)
      expect(mapUrl).toContain('map.baidu.com')
      expect(mapUrl).toContain(encodeURIComponent(address))

      const result = openMap(address)
      expect(result).toBe(true)
      expect(window.open).toHaveBeenCalledWith(mapUrl, '_blank')
    })

    test('无效地址的导航流程应失败', () => {
      const address = ''

      expect(validateAddress(address)).toBe(false)
      expect(generateMapUrl(address)).toBe('')
      expect(openMap(address)).toBe(false)
      expect(window.open).not.toHaveBeenCalled()
    })

    test('配送地址导航测试', () => {
      const deliveryAddress = '上海市浦东新区张江高科技园区B栋2002室'

      const isValid = validateAddress(deliveryAddress)
      expect(isValid).toBe(true)

      const navUrl = generateNavigationUrl(deliveryAddress)
      expect(navUrl).toContain('dir/')
      expect(navUrl).toContain('destination=')

      const result = openNavigation(deliveryAddress)
      expect(result).toBe(true)
      expect(window.open).toHaveBeenCalledWith(navUrl, '_blank')
    })

    test('客户地址地图查看测试', () => {
      const customerAddress = '广州市天河区珠江新城C塔3003室'

      const isValid = validateAddress(customerAddress)
      expect(isValid).toBe(true)

      const mapUrl = generateMapUrl(customerAddress)
      expect(mapUrl).toBe(
        `https://map.baidu.com/search/${encodeURIComponent(customerAddress)}`
      )
    })
  })
})
