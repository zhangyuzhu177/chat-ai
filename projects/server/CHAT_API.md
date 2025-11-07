# Chat API 文档

## 概述

已完成 DeepSeek 聊天应用的完整后端实现，包含以下功能模块：

- **Model 模块**：AI 模型管理
- **Conversation 模块**：对话会话管理
- **Message 模块**：聊天消息管理
- **Chat 模块**：核心聊天逻辑和 DeepSeek API 集成

## 数据库实体

### 1. Model（AI 模型）
```typescript
{
  id: string                  // UUID
  name: string                // 模型名称（如 deepseek-chat）
  displayName: string         // 显示名称
  provider: string            // 提供商（默认 deepseek）
  description: string         // 模型描述
  maxTokens: number           // 最大 token 数
  isActive: boolean           // 是否启用
  icon: string                // 图标 URL
  sortOrder: number           // 排序权重
  createdAt: Date
  updatedAt: Date
}
```

### 2. Conversation（对话会话）
```typescript
{
  id: string                  // UUID
  title: string               // 对话标题
  userId: string              // 用户 ID
  modelId: string             // 模型 ID
  systemPrompt: string        // 系统提示词
  config: {                   // 配置参数
    temperature?: number
    topP?: number
    maxTokens?: number
  }
  isPinned: boolean           // 是否置顶
  messageCount: number        // 消息数量
  totalTokens: number         // 总 token 消耗
  createdAt: Date
  updatedAt: Date
  deletedAt: Date             // 软删除
}
```

### 3. Message（聊天消息）
```typescript
{
  id: string                  // UUID
  conversationId: string      // 对话 ID
  role: 'user' | 'assistant' | 'system'
  content: string             // 消息内容
  tokenCount: number          // token 消耗
  metadata: {                 // 元数据
    finishReason?: string
    model?: string
    attachments?: any[]
  }
  isError: boolean            // 是否出错
  errorMessage: string        // 错误信息
  createdAt: Date
}
```

## API 接口

### Model 模块

#### 获取所有启用的模型（公开）
```http
GET /api/model/active
```

#### 获取所有模型（需登录）
```http
GET /api/model
Authorization: Cookie (token)
```

#### 创建模型（需登录）
```http
POST /api/model
Authorization: Cookie (token)
Content-Type: application/json

{
  "name": "deepseek-chat",
  "displayName": "DeepSeek Chat",
  "provider": "deepseek",
  "description": "通用对话模型",
  "maxTokens": 4096,
  "isActive": true,
  "sortOrder": 1
}
```

#### 更新模型（需登录）
```http
PUT /api/model/:id
Authorization: Cookie (token)
```

#### 删除模型（需登录）
```http
DELETE /api/model/:id
Authorization: Cookie (token)
```

---

### Conversation 模块

#### 创建对话（需登录）
```http
POST /api/conversation
Authorization: Cookie (token)
Content-Type: application/json

{
  "modelId": "uuid-of-model",
  "title": "新对话",
  "systemPrompt": "你是一个有帮助的 AI 助手",
  "config": {
    "temperature": 0.7,
    "topP": 1.0,
    "maxTokens": 2000
  }
}
```

#### 获取当前用户的所有对话（需登录）
```http
GET /api/conversation
Authorization: Cookie (token)
```

响应：
```json
[
  {
    "id": "uuid",
    "title": "对话标题",
    "userId": "user-uuid",
    "modelId": "model-uuid",
    "model": {
      "id": "model-uuid",
      "name": "deepseek-chat",
      "displayName": "DeepSeek Chat"
    },
    "isPinned": false,
    "messageCount": 10,
    "totalTokens": 5000,
    "createdAt": "2025-11-05T...",
    "updatedAt": "2025-11-05T..."
  }
]
```

#### 获取单个对话详情（需登录）
```http
GET /api/conversation/:id
Authorization: Cookie (token)
```

响应包含对话信息和所有消息列表。

#### 更新对话（需登录）
```http
PUT /api/conversation/:id
Authorization: Cookie (token)
Content-Type: application/json

{
  "title": "新标题",
  "isPinned": true,
  "systemPrompt": "更新的系统提示词",
  "config": {
    "temperature": 0.8
  }
}
```

#### 删除对话（需登录，软删除）
```http
DELETE /api/conversation/:id
Authorization: Cookie (token)
```

---

### Message 模块

#### 创建消息（需登录）
```http
POST /api/message
Authorization: Cookie (token)
Content-Type: application/json

{
  "conversationId": "conversation-uuid",
  "role": "user",
  "content": "你好",
  "tokenCount": 2
}
```

#### 获取对话的所有消息（需登录）
```http
GET /api/message/conversation/:conversationId
Authorization: Cookie (token)
```

#### 删除对话的所有消息（需登录）
```http
DELETE /api/message/conversation/:conversationId
Authorization: Cookie (token)
```

---

### Chat 模块（核心聊天功能）

#### 发送消息（普通响应）（需登录）
```http
POST /api/chat/send
Authorization: Cookie (token)
Content-Type: application/json

{
  "conversationId": "conversation-uuid",
  "content": "你好，请介绍一下 TypeScript"
}
```

响应：
```json
{
  "status": 200,
  "message": "success",
  "data": {
    "userMessage": {
      "id": "message-uuid",
      "role": "user",
      "content": "你好，请介绍一下 TypeScript",
      "createdAt": "2025-11-05T..."
    },
    "assistantMessage": {
      "id": "message-uuid",
      "role": "assistant",
      "content": "TypeScript 是...",
      "tokenCount": 150,
      "createdAt": "2025-11-05T..."
    },
    "usage": {
      "promptTokens": 20,
      "completionTokens": 150,
      "totalTokens": 170
    }
  }
}
```

#### 发送消息（流式响应 SSE）（需登录）
```http
POST /api/chat/send-stream
Authorization: Cookie (token)
Content-Type: application/json

{
  "conversationId": "conversation-uuid",
  "content": "你好，请介绍一下 TypeScript"
}
```

响应（Server-Sent Events）：
```
data: {"content":"Type"}

data: {"content":"Script"}

data: {"content":" 是"}

...

data: [DONE]
```

---

## 环境变量配置

在 `.env` 文件中添加以下配置：

```env
# DeepSeek API
DEEPSEEK_API_KEY=your-deepseek-api-key-here

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USER=zyz
DB_PSWD=123456
DB_NAME=nest_demo

# JWT
JWT_LOGIN_AUTH_SECRET=your-secret-key
JWT_LOGIN_AUTH_EXPIRE_IN_SECONDS=28800
```

## 初始化步骤

### 1. 安装依赖
```bash
cd projects/server
pnpm install
```

### 2. 配置环境变量
编辑 `.env` 文件，填入你的 DeepSeek API Key。

### 3. 启动数据库
确保 PostgreSQL 数据库正在运行。

### 4. 初始化模型数据（可选）
```bash
npx ts-node src/scripts/seed-models.ts
```

### 5. 启动服务
```bash
pnpm dev
```

服务将运行在 `http://localhost:3005`。

## 使用流程示例

### 1. 创建对话
```bash
curl -X POST http://localhost:3005/api/conversation \
  -H "Cookie: token=your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "modelId": "model-uuid",
    "title": "学习 TypeScript"
  }'
```

### 2. 发送消息
```bash
curl -X POST http://localhost:3005/api/chat/send \
  -H "Cookie: token=your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conversation-uuid",
    "content": "什么是 TypeScript?"
  }'
```

### 3. 获取对话历史
```bash
curl http://localhost:3005/api/conversation/conversation-uuid \
  -H "Cookie: token=your-jwt-token"
```

## 注意事项

1. **认证**：所有聊天相关接口都需要登录，使用 `@IsLogin()` 守卫保护
2. **权限控制**：用户只能访问自己的对话和消息
3. **软删除**：对话支持软删除，可实现"回收站"功能
4. **Token 统计**：自动记录每条消息和每个对话的 token 消耗
5. **错误处理**：消息发送失败时会标记错误状态
6. **流式响应**：支持 SSE 流式响应，实现打字机效果
7. **历史上下文**：自动包含最近 20 条消息作为上下文

## 前端集成建议

### 1. 创建对话组件
- 显示对话列表（置顶、普通、已删除）
- 支持新建、编辑、删除对话
- 显示对话统计信息（消息数、token 数）

### 2. 聊天组件
- 消息列表展示（用户/AI 消息样式区分）
- 输入框和发送按钮
- 流式响应的打字机效果
- 错误消息提示
- 加载状态

### 3. 模型选择器
- 显示可用模型列表
- 支持切换模型
- 显示模型描述和参数

### 4. 设置面板
- 配置 temperature、top_p 等参数
- 设置系统提示词
- 查看 token 使用统计

## 下一步优化建议

1. **流式响应优化**：在流式响应中实时计算 token 消耗
2. **上下文管理**：实现智能上下文窗口管理，避免超出 token 限制
3. **消息重发**：支持失败消息的重新发送
4. **消息编辑**：支持编辑已发送的消息
5. **分支对话**：支持从历史消息创建新的对话分支
6. **文件上传**：支持上传文件（图片、文档）
7. **导出功能**：支持导出对话为 Markdown/PDF
8. **分享功能**：生成对话分享链接
9. **搜索功能**：在对话历史中搜索
10. **多模型对比**：同时使用多个模型回答同一问题
