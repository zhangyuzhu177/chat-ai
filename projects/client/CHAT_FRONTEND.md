# AI 聊天前端功能文档

## 概述

已完成基于 Next.js 16 + React 19 的 AI 聊天前端实现，包含完整的对话管理、消息展示和流式响应功能。

## 项目结构

```
src/
├── types/
│   └── chat.ts                 # TypeScript 类型定义
├── services/
│   └── chatApi.ts              # API 服务层
├── hooks/
│   ├── useFetch.ts             # 通用请求 Hook
│   └── useChat.ts              # 聊天 Hook
└── app/
    ├── components/
    │   └── Chat/
    │       ├── ConversationList.tsx    # 对话列表组件
    │       ├── MessageList.tsx         # 消息列表组件
    │       ├── ChatInput.tsx           # 聊天输入框
    │       └── ModelSelector.tsx       # 模型选择器
    └── (page)/
        └── page.tsx            # 聊天主页面
```

## 核心功能

### 1. 对话管理
- ✅ 创建新对话
- ✅ 对话列表展示
- ✅ 对话置顶/取消置顶
- ✅ 删除对话（带确认）
- ✅ 切换对话
- ✅ 显示消息数和 token 消耗统计

### 2. 消息功能
- ✅ 发送文本消息
- ✅ 流式响应（打字机效果）
- ✅ 消息历史展示
- ✅ 用户/AI 消息区分
- ✅ 错误消息显示
- ✅ 自动滚动到最新消息
- ✅ Token 消耗统计

### 3. 模型管理
- ✅ 模型列表展示
- ✅ 模型切换
- ✅ 模型信息显示（名称、描述、参数）
- ✅ 禁用状态处理

### 4. 用户体验
- ✅ 深色模式支持
- ✅ 响应式布局
- ✅ 加载状态提示
- ✅ 空状态提示
- ✅ 键盘快捷键（Enter 发送，Shift+Enter 换行）
- ✅ 自动调整输入框高度
- ✅ 字符计数

## 技术栈

- **框架**: Next.js 16 + React 19
- **语言**: TypeScript 5+
- **样式**: TailwindCSS v4
- **图标**: lucide-react
- **主题**: next-themes（深色模式支持）
- **状态管理**: React Hooks (useState, useEffect, useCallback)
- **API 调用**: Fetch API + Server-Sent Events (SSE)

## 使用说明

### 环境配置

确保 `.env` 文件中配置了正确的 API 地址：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3005/api
```

### 启动开发服务器

```bash
cd projects/client
pnpm dev
```

访问 `http://localhost:3000`

## 主要组件说明

### 1. `useChat` Hook

核心聊天逻辑 Hook，提供以下功能：

```typescript
const {
  // 状态
  models,                    // 可用模型列表
  conversations,             // 对话列表
  currentConversation,       // 当前对话
  messages,                  // 当前对话的消息列表
  isLoading,                 // 加载状态
  isSending,                 // 发送中状态
  streamingContent,          // 流式响应内容

  // 方法
  loadModels,                // 加载模型列表
  loadConversations,         // 加载对话列表
  loadConversation,          // 加载单个对话
  createConversation,        // 创建对话
  updateConversation,        // 更新对话
  deleteConversation,        // 删除对话
  sendMessage,               // 发送消息（普通）
  sendMessageStream,         // 发送消息（流式）
  switchConversation,        // 切换对话
  clearCurrentConversation,  // 清空当前对话
} = useChat()
```

### 2. `ChatApi` Service

封装所有 API 调用：

- `getActiveModels()` - 获取启用的模型
- `createConversation(dto)` - 创建对话
- `getConversations()` - 获取对话列表
- `getConversationById(id)` - 获取对话详情
- `updateConversation(id, dto)` - 更新对话
- `deleteConversation(id)` - 删除对话
- `sendMessage(dto)` - 发送消息（普通）
- `sendMessageStream(dto, callbacks)` - 发送消息（流式）

### 3. UI 组件

#### ConversationList
对话列表组件，支持：
- 置顶对话分组
- 对话信息展示
- 删除和置顶操作
- 空状态提示

#### MessageList
消息列表组件，支持：
- 用户/AI 消息区分
- 流式响应展示
- 错误消息显示
- 自动滚动
- Token 统计

#### ChatInput
聊天输入框，支持：
- 多行输入
- 自动调整高度
- Enter 发送
- Shift+Enter 换行
- 字符计数
- 禁用状态

#### ModelSelector
模型选择器，支持：
- 模型列表下拉
- 模型信息展示
- 选中状态标记

## 使用流程

### 1. 创建新对话

```typescript
// 选择模型
setSelectedModelId(modelId)

// 创建对话
await createConversation({
  modelId: selectedModelId,
  title: '我的对话',
  systemPrompt: '你是一个有帮助的 AI 助手',
  config: {
    temperature: 0.7,
    topP: 1.0,
  },
})
```

### 2. 发送消息

```typescript
// 流式发送
await sendMessageStream('你好，请介绍一下 TypeScript')

// 普通发送
await sendMessage('你好，请介绍一下 TypeScript')
```

### 3. 管理对话

```typescript
// 切换对话
switchConversation(conversation)

// 更新对话（置顶）
await updateConversation(conversationId, { isPinned: true })

// 删除对话
await deleteConversation(conversationId)
```

## API 响应格式

所有 API 响应都遵循以下格式：

```typescript
{
  status: 200,
  message: 'success',
  data: {
    // 实际数据
  }
}
```

## 流式响应处理

流式响应使用 Server-Sent Events (SSE)：

```typescript
// 服务端发送格式
data: {"content":"Hello"}
data: {"content":" World"}
data: [DONE]

// 客户端接收
await chatApi.sendMessageStream(
  dto,
  (content) => console.log('收到:', content),
  () => console.log('完成'),
  (error) => console.error('错误:', error)
)
```

## 样式设计

### 颜色方案

**亮色模式**:
- 背景: `bg-white`, `bg-[#F9F9F9]`
- 边框: `border-[#EDEDED]`
- 文字: `text-gray-900`, `text-gray-500`

**暗色模式**:
- 背景: `dark:bg-[#181818]`, `dark:bg-[#212121]`
- 边框: `dark:border-[#303030]`, `dark:border-[#242424]`
- 文字: `dark:text-gray-100`, `dark:text-gray-400`

### 响应式设计

- 左侧对话列表固定宽度 320px (`w-80`)
- 右侧聊天区域自适应宽度
- 消息区域最大宽度 4xl (`max-w-4xl`)

## 错误处理

### 网络错误
```typescript
try {
  await sendMessage(content)
} catch (error) {
  // 显示错误提示
  alert('发送消息失败')
  // 标记消息为错误状态
}
```

### 认证错误
`useFetch` Hook 自动处理 403 错误，重定向到登录页面：
```typescript
if (res.status === 403) {
  router.replace('/auth')
}
```

## 性能优化

1. **useCallback**: 所有事件处理函数使用 `useCallback` 缓存
2. **条件渲染**: 空状态和加载状态分别渲染
3. **虚拟滚动**: 消息列表使用原生滚动，性能良好
4. **流式响应**: 使用 SSE 实时更新，减少内存占用

## 下一步优化建议

### 功能增强
1. **消息编辑**: 支持编辑已发送的消息
2. **消息重发**: 支持重新发送失败的消息
3. **对话搜索**: 在对话列表中搜索
4. **消息搜索**: 在当前对话中搜索消息
5. **导出对话**: 导出为 Markdown/JSON
6. **分享对话**: 生成分享链接
7. **语音输入**: 支持语音转文字
8. **文件上传**: 支持上传图片和文档
9. **代码高亮**: 对代码块进行语法高亮
10. **Markdown 渲染**: 支持富文本展示

### 用户体验
1. **快捷键**: 添加更多快捷键（如 Ctrl+K 搜索）
2. **拖拽排序**: 支持对话拖拽排序
3. **批量操作**: 支持批量删除对话
4. **离线支持**: PWA + IndexedDB 缓存
5. **通知**: 新消息桌面通知

### 性能优化
1. **虚拟列表**: 对话列表和消息列表使用虚拟滚动
2. **图片懒加载**: 消息中的图片懒加载
3. **消息分页**: 历史消息分页加载
4. **WebSocket**: 替代 SSE，支持双向通信

## 常见问题

### Q: 为什么发送消息没有响应？
A: 检查：
1. 是否已登录（有 token cookie）
2. 后端服务是否运行（`http://localhost:3005`）
3. 环境变量配置是否正确
4. 浏览器控制台是否有错误

### Q: 流式响应不工作？
A: 确保：
1. 后端正确实现了 SSE 接口
2. 浏览器支持 SSE（现代浏览器都支持）
3. 网络连接稳定

### Q: 深色模式不生效？
A: 检查：
1. `next-themes` 是否正确配置
2. `ThemeProvider` 是否包裹应用
3. 浏览器是否支持深色模式

## 部署说明

### 生产构建

```bash
cd projects/client
pnpm build
pnpm start
```

### 环境变量

生产环境需要配置：
```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api
```

### Docker 部署（可选）

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## 总结

前端聊天功能已完整实现，包含：
- ✅ 完整的对话管理
- ✅ 流式消息响应
- ✅ 模型选择和配置
- ✅ 深色模式支持
- ✅ 良好的用户体验

可以立即使用，也可以根据需求进一步扩展功能。
