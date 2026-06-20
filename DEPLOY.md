# 员工端任务处理凭证系统 - 部署文档

## 1. 项目概述

员工端任务处理凭证系统是一个用于管理租赁任务全生命周期的Web应用，包含任务列表查看、任务详情处理、凭证上传、一键导航等功能。

### 1.1 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Vue.js | 3.4.0 |
| 前端构建工具 | Vite | 5.0.0 |
| 前端路由 | Vue Router | 4.2.5 |
| HTTP客户端 | Axios | 1.6.2 |
| 前端测试 | Vitest | 4.1.9 |
| 后端框架 | Express | 4.18.2 |
| 后端测试 | Jest | 30.4.2 |
| 跨域支持 | CORS | 2.8.5 |

### 1.2 项目结构

```
├── client/                 # 前端应用
│   ├── src/
│   │   ├── api/           # API接口
│   │   ├── components/    # 公共组件
│   │   ├── composables/   # 组合式函数
│   │   ├── constants/     # 常量定义
│   │   ├── router/        # 路由配置
│   │   ├── utils/         # 工具函数
│   │   ├── views/         # 页面视图
│   │   └── main.js        # 入口文件
│   ├── tests/             # 前端测试
│   └── package.json
├── server/                 # 后端服务
│   ├── constants/         # 常量定义
│   ├── data/              # 模拟数据
│   ├── routes/            # 路由定义
│   ├── services/          # 业务逻辑
│   ├── tests/             # 后端测试
│   ├── utils/             # 工具函数
│   ├── app.js             # 入口文件
│   └── package.json
└── package.json           # 根配置
```

### 1.3 功能模块

- **任务列表**：展示所有租赁任务，支持按类型、状态、优先级筛选
- **任务详情**：查看任务详细信息，包括客户信息、物品信息
- **交付任务**：上传交付照片、填写备注、确认交付
- **验收任务**：上传验收报告、设备照片、定损单，确认验收结果
- **报修任务**：上传维修照片、填写维修结果和费用
- **押金退还**：确认押金退还金额和方式
- **一键导航**：集成百度地图，支持地址导航
- **凭证管理**：各类任务凭证的上传、预览和管理

---

## 2. 环境要求

### 2.1 软件环境

| 软件 | 最低版本 | 推荐版本 |
|------|----------|----------|
| Node.js | 16.0.0 | 18.x LTS |
| npm | 8.0.0 | 9.x |
| 浏览器 | Chrome 90+ / Firefox 88+ / Safari 14+ | Chrome 最新版 |

### 2.2 端口配置

| 服务 | 默认端口 | 说明 |
|------|----------|------|
| 前端开发服务 | 5173 | Vite开发服务器 |
| 后端服务 | 3000 | Express API服务 |
| 前端预览服务 | 4173 | Vite生产预览 |

### 2.3 浏览器权限要求

| 权限 | 用途 | 必要性 |
|------|------|--------|
| 文件读取 | 上传照片和文件 | 必需 |
| 弹出窗口 | 打开百度地图导航 | 必需 |
| 剪贴板 | 复制客户电话号码 | 可选 |

---

## 3. 安装与部署

### 3.1 依赖安装

```bash
# 方式一：一键安装所有依赖
npm run install:all

# 方式二：分别安装
# 安装后端依赖
npm run install:server

# 安装前端依赖
npm run install:client
```

### 3.2 开发环境启动

```bash
# 方式一：同时启动前后端
npm run dev

# 方式二：分别启动
# 启动后端服务
npm run dev:server

# 启动前端服务（新开终端）
npm run dev:client
```

启动成功后：
- 前端访问地址：http://localhost:5173
- 后端API地址：http://localhost:3000

### 3.3 生产环境构建

```bash
# 构建前端应用
npm run build:client
```

构建产物将生成在 `client/dist/` 目录下。

### 3.4 生产环境运行

```bash
# 启动后端服务
npm run start:server

# 预览前端构建产物
npm run start:client
```

---

## 4. 上传存储配置

### 4.1 存储方案说明

当前系统采用**前端本地临时存储**方案，文件以 DataURL (Base64) 格式保存在浏览器内存中。

> 生产环境建议接入后端文件存储服务（如阿里云OSS、腾讯云COS、MinIO等）。

### 4.2 上传组件配置

#### 4.2.1 照片上传组件 (PhotoUploader)

**配置文件**：[usePhotoUpload.js](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/019-员工端任务处理凭证/client/src/composables/usePhotoUpload.js)

| 参数 | 默认值 | 说明 |
|------|--------|------|
| maxCount | 9 | 最大上传数量 |
| 支持格式 | image/* | 所有图片格式 |
| 存储方式 | DataURL | Base64编码字符串 |
| 读取方式 | FileReader.readAsDataURL | 浏览器本地读取 |

**使用示例**：
```javascript
import { usePhotoUpload } from './composables/usePhotoUpload'

// 限制最多上传9张照片
const { photos, handlePhotoUpload, removePhoto } = usePhotoUpload(9)
```

#### 4.2.2 文件上传组件 (FileUploader)

**配置文件**：[useFileUpload.js](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/019-员工端任务处理凭证/client/src/composables/useFileUpload.js)

| 参数 | 默认值 | 说明 |
|------|--------|------|
| maxCount | 5 | 最大上传数量 |
| 支持格式 | .pdf, .doc, .docx, .xls, .xlsx, image/* | 文档和图片 |
| 存储方式 | DataURL | Base64编码字符串 |
| 文件信息 | name, size, data | 包含文件名、大小和数据 |

**文件大小格式化**：
```javascript
// 自动转换为 B / KB / MB
formatFileSize(file.size)  // "2.5 MB"
```

### 4.3 各任务类型上传配置

| 任务类型 | 上传项 | 最大数量 | 必填 | 支持格式 |
|----------|--------|----------|------|----------|
| 交付任务 | 交付照片 | 9张 | 是 | image/* |
| 验收任务 | 验收报告 | 5个 | 是 | .pdf,.doc,.docx,.xls,.xlsx,image/* |
| 验收任务 | 设备状态照片 | 9张 | 是 | image/* |
| 验收任务 | 定损单 | 3个 | 否 | .pdf,.doc,.docx,image/* |
| 报修任务 | 维修照片 | 9张 | 是 | image/* |
| 报修任务 | 维修凭证 | 5个 | 否 | .pdf,.doc,.docx,image/* |
| 押金退还 | 退款凭证 | 5个 | 是 | .pdf,.doc,.docx,image/* |

### 4.4 存储限制与优化建议

**当前限制**：
- 浏览器内存限制：单文件建议不超过 10MB
- Base64 编码会增加约 33% 的数据体积
- 页面刷新后数据会丢失

**生产环境优化建议**：

1. **接入后端文件存储**：
```javascript
// 示例：上传到后端API
const uploadFile = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await axios.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data.url
}
```

2. **文件类型白名单验证**：
```javascript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const isValid = ALLOWED_TYPES.includes(file.type)
```

3. **文件大小限制**：
```javascript
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const isSizeValid = file.size <= MAX_SIZE
```

4. **图片压缩**：
```javascript
// 使用 Canvas 压缩图片后再上传
const compressImage = (file, quality = 0.8) => {
  // 图片压缩逻辑
}
```

---

## 5. 导航权限配置

### 5.1 导航功能说明

系统集成百度地图导航功能，支持根据客户地址一键打开地图导航。

**配置文件**：[navigation.js](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/019-员工端任务处理凭证/client/src/utils/navigation.js)

### 5.2 导航URL生成规则

#### 5.2.1 地图查看URL
```
https://map.baidu.com/search/{编码后的地址}
```

#### 5.2.2 导航URL
```
https://map.baidu.com/dir/?destination={编码后的地址}
```

### 5.3 地址编码规则

| 规则 | 说明 |
|------|------|
| 编码方式 | `encodeURIComponent()` | UTF-8编码 |
| 空格处理 | 自动去除首尾空白字符 |
| 特殊字符 | 自动编码 &、#、@ 等特殊字符 |
| 中文支持 | 完整支持中文地址编码 |

**编码示例**：
```javascript
// 输入
'北京市朝阳区科技园A座'

// 输出（URL编码后）
'%E5%8C%97%E4%BA%AC%E5%B8%82%E6%9C%9D%E9%98%B3%E5%8C%BA%E7%A7%91%E6%8A%80%E5%9B%ADA%E5%BA%A7'
```

### 5.4 地址验证规则

**配置文件**：[navigation.js](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/019-员工端任务处理凭证/client/src/utils/navigation.js#L42-L48)

| 验证项 | 规则 |
|--------|------|
| 非空验证 | 不能为空、null、undefined |
| 类型验证 | 必须为字符串类型 |
| 空白验证 | 不能全为空白字符（空格、制表符、换行符） |
| 长度验证 | 1 ~ 200 字符 |

**验证示例**：
```javascript
validateAddress('北京市朝阳区科技园A座1001室')  // true
validateAddress('')                              // false
validateAddress('   ')                           // false
validateAddress(null)                            // false
validateAddress(123)                             // false
validateAddress('A'.repeat(201))                 // false
```

### 5.5 浏览器权限配置

#### 5.5.1 弹出窗口权限

导航功能使用 `window.open()` 打开新标签页，需要浏览器允许弹出窗口。

**可能遇到的问题及解决**：

| 问题 | 原因 | 解决方法 |
|------|------|----------|
| 弹窗被拦截 | 浏览器默认阻止非用户触发的弹窗 | 确保导航按钮点击事件是用户直接触发 |
| 无法打开 | 浏览器禁用了JavaScript | 提示用户启用JavaScript |

#### 5.5.2 跨域配置

百度地图导航在新窗口打开，不存在跨域问题。但在开发环境中，需要配置Vite允许外部链接。

**CORS配置（后端）**：
[app.js](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/019-员工端任务处理凭证/server/app.js)

```javascript
const cors = require('cors')
app.use(cors())
```

### 5.6 导航功能API

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `generateMapUrl(address)` | address: string | string | 生成地图搜索URL |
| `openMap(address)` | address: string | boolean | 打开地图，成功返回true |
| `generateNavigationUrl(address)` | address: string | string | 生成导航URL |
| `openNavigation(address)` | address: string | boolean | 打开导航，成功返回true |
| `formatAddress(address)` | address: string | string | 格式化地址（去首尾空格） |
| `validateAddress(address)` | address: string | boolean | 验证地址有效性 |

### 5.7 生产环境注意事项

1. **HTTPS部署**：生产环境必须使用HTTPS，否则部分浏览器可能限制弹窗功能
2. **百度地图AK配置**（可选）：如果需要使用百度地图JavaScript API，需要申请密钥
3. **移动端适配**：在移动端可以配置拉起百度地图APP
4. **备用方案**：提供地址复制功能，作为导航失败的备用方案

---

## 6. 验收命令

### 6.1 测试框架说明

| 层级 | 测试框架 | 配置文件 |
|------|----------|----------|
| 前端 | Vitest | [vitest.config.js](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/019-员工端任务处理凭证/client/vitest.config.js) |
| 后端 | Jest | package.json 中配置 |

### 6.2 前端测试命令

**配置文件**：[client/package.json](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/019-员工端任务处理凭证/client/package.json#L6-L12)

#### 6.2.1 启动开发模式测试（监听模式）
```bash
cd client && npm test
```

#### 6.2.2 单次运行测试
```bash
cd client && npm run test:run
```

#### 6.2.3 生成覆盖率报告
```bash
cd client && npm run test:coverage
```

### 6.3 后端测试命令

**配置文件**：[server/package.json](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/019-员工端任务处理凭证/server/package.json#L6-L11)

#### 6.3.1 单次运行测试
```bash
cd server && npm test
```

#### 6.3.2 启动监听模式测试
```bash
cd server && npm run test:watch
```

#### 6.3.3 生成覆盖率报告
```bash
cd server && npm run test:coverage
```

### 6.4 测试用例说明

#### 6.4.1 前端导航功能测试

**测试文件**：[navigation.test.js](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/019-员工端任务处理凭证/client/tests/navigation.test.js)

测试覆盖范围：
- ✅ 地图URL生成（正常地址、空地址、空白地址、非字符串）
- ✅ 导航URL生成（正常地址、空地址、空白地址）
- ✅ 打开地图功能（有效地址、无效地址）
- ✅ 打开导航功能（有效地址、无效地址）
- ✅ 地址格式化（去空格、空值处理）
- ✅ 地址验证（长度验证、类型验证、空白验证）
- ✅ 集成测试（完整导航流程）

运行命令：
```bash
cd client && npm run test:run -- navigation.test.js
```

#### 6.4.2 后端任务服务测试

**测试文件**：[taskService.test.js](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/019-员工端任务处理凭证/server/tests/taskService.test.js)

测试覆盖范围：
- ✅ 任务状态更新（交付、验收、报修）
- ✅ 后续任务创建（交付→租赁中、验收→押金退还）
- ✅ 操作日志生成（各状态节点日志）
- ✅ 任务类型验证
- ✅ 任务筛选功能（按类型、状态、优先级）
- ✅ 交付凭证功能
- ✅ 验收报告功能
- ✅ 报修完成功能

运行命令：
```bash
cd server && npm test -- taskService.test.js
```

### 6.5 一键验收命令

#### 6.5.1 完整验收流程
```bash
# 1. 安装依赖
npm run install:all

# 2. 运行后端测试
cd server && npm run test:coverage

# 3. 运行前端测试
cd ../client && npm run test:coverage

# 4. 构建前端
npm run build:client
```

#### 6.5.2 快速验收脚本
```bash
# 运行所有测试并生成报告
npm run test:all

# 或者分别执行
cd server && npm test && cd ../client && npm run test:run
```

### 6.6 验收标准

| 验收项 | 标准 | 命令 |
|--------|------|------|
| 后端测试通过率 | 100% | `cd server && npm test` |
| 前端测试通过率 | 100% | `cd client && npm run test:run` |
| 后端代码覆盖率 | ≥ 80% | `cd server && npm run test:coverage` |
| 前端代码覆盖率 | ≥ 80% | `cd client && npm run test:coverage` |
| 前端构建 | 无错误 | `npm run build:client` |
| 服务启动 | 正常运行 | `npm run dev` |

### 6.7 手动验收步骤

#### 6.7.1 启动服务
```bash
npm run dev
```

#### 6.7.2 页面访问验证
1. 访问 http://localhost:5173
2. 确认页面正常加载，无控制台错误
3. 检查路由跳转正常

#### 6.7.3 功能验收清单

| 功能 | 操作步骤 | 预期结果 |
|------|----------|----------|
| 任务列表 | 打开首页 | 显示任务列表，支持筛选 |
| 查看详情 | 点击任意任务 | 显示任务完整信息 |
| 照片上传 | 在详情页上传照片 | 照片正常显示，可删除 |
| 文件上传 | 上传PDF/Word文档 | 文件列表正常显示 |
| 一键导航 | 点击地址旁导航按钮 | 新窗口打开百度地图 |
| 确认交付 | 填写信息后点击确认 | 状态更新为已交付 |
| 确认验收 | 填写验收信息后确认 | 状态更新为验收通过 |
| 复制电话 | 点击电话号码 | 提示复制成功 |

#### 6.7.4 API接口验证

```bash
# 获取任务列表
curl http://localhost:3000/api/rental-tasks

# 获取任务详情
curl http://localhost:3000/api/rental-tasks/1001

# 确认交付（POST）
curl -X POST http://localhost:3000/api/rental-tasks/1001/delivery \
  -H "Content-Type: application/json" \
  -d '{"deliveryPhotos": ["test.jpg"], "deliveryRemark": "测试交付"}'
```

---

## 7. 常见问题排查

### 7.1 上传相关问题

| 问题 | 可能原因 | 解决方法 |
|------|----------|----------|
| 照片上传后不显示 | 文件读取失败 | 检查文件格式是否支持 |
| 文件上传进度卡住 | 文件过大 | 压缩文件或检查网络 |
| 刷新后上传的文件丢失 | 前端内存存储 | 生产环境接入后端存储 |

### 7.2 导航相关问题

| 问题 | 可能原因 | 解决方法 |
|------|----------|----------|
| 点击导航没反应 | 浏览器阻止弹窗 | 在浏览器设置中允许弹窗 |
| 百度地图显示地址错误 | 地址编码问题 | 检查地址格式，去除特殊字符 |
| 导航无法打开 | JavaScript被禁用 | 启用浏览器JavaScript |

### 7.3 测试相关问题

| 问题 | 可能原因 | 解决方法 |
|------|----------|----------|
| Vitest 找不到测试文件 | 测试文件命名错误 | 确保文件名为 *.test.js |
| Jest 测试失败 | 依赖未安装 | 重新运行 npm install |
| 覆盖率低 | 测试用例不完整 | 补充边缘情况测试 |

---

## 8. 附录

### 8.1 完整命令清单

```bash
# 依赖安装
npm run install:all       # 安装所有依赖
npm run install:server    # 安装后端依赖
npm run install:client    # 安装前端依赖

# 开发运行
npm run dev               # 同时启动前后端
npm run dev:server        # 启动后端
npm run dev:client        # 启动前端

# 测试命令
cd server && npm test              # 后端测试
cd server && npm run test:watch    # 后端测试（监听）
cd server && npm run test:coverage # 后端覆盖率
cd client && npm test              # 前端测试（监听）
cd client && npm run test:run      # 前端测试（单次）
cd client && npm run test:coverage # 前端覆盖率

# 构建与运行
npm run build:client      # 构建前端
npm run start:server      # 启动后端生产服务
npm run start:client      # 预览前端构建产物
```

### 8.2 相关文件索引

| 文件 | 说明 |
|------|------|
| [usePhotoUpload.js](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/019-员工端任务处理凭证/client/src/composables/usePhotoUpload.js) | 照片上传组合函数 |
| [useFileUpload.js](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/019-员工端任务处理凭证/client/src/composables/useFileUpload.js) | 文件上传组合函数 |
| [navigation.js](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/019-员工端任务处理凭证/client/src/utils/navigation.js) | 导航工具函数 |
| [navigation.test.js](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/019-员工端任务处理凭证/client/tests/navigation.test.js) | 导航功能测试 |
| [taskService.test.js](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/019-员工端任务处理凭证/server/tests/taskService.test.js) | 任务服务测试 |
| [AcceptanceTaskDetail.vue](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/019-员工端任务处理凭证/client/src/views/AcceptanceTaskDetail.vue) | 验收任务详情页 |
| [router/index.js](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/019-员工端任务处理凭证/client/src/router/index.js) | 路由配置 |
