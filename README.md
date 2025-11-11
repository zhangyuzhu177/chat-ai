# AI Chat 

## 技术栈

- 前端 (Client):
  - Next.js、TypeScript、TailwindCSS、shadcn-ui
- 后端 (Server)
  - nest.js、TypeScript、TypeORM、PostgreSQL、Redis

### 开发工具
- **包管理器**: pnpm (workspace)
- **代码检查**: ESLint
- **代码格式化**: Prettier

## 快速开始

### 环境要求

- Node.js >= 18.x
- pnpm >= 8.x
- PostgreSQL >= 14
- Redis >= 6

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd chat-ai

# 安装所有依赖
pnpm install
```

### 环境配置

#### 后端配置

在 `projects/server` 目录下创建环境配置文件 (按需选择):

```bash
# 开发环境
.env.dev

# 生产环境
.env.production

# 或使用默认配置
.env
```

**必需的环境变量：**

```env
# 服务配置
API_PREFIX=api                  # API 前缀
PORT=3005                       # 服务端口

# 客户端配置
CLIENT_URL=http://localhost:3000  # 前端地址 (CORS 配置)

# 数据库配置
DB_USER=your_db_user
DB_PSWD=your_db_password
DB_NAME=chat_ai
DB_HOST=localhost
DB_PORT=5432

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=                 # 可选
REDIS_DB=0

# JWT 配置
JWT_LOGIN_AUTH_SECRET=your_secret_key_here
JWT_EXPIRES_IN=8h              # 令牌有效期

# GitHub OAuth
CLIENT_ID=your_github_client_id
CLIENT_SECRET=your_github_client_secret

# OpenAI 配置
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1  # 可选，用于兼容其他 API
```

**获取 GitHub OAuth 凭据：**

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 创建新的 OAuth App
3. 设置回调 URL: `http://localhost:3005/api/auth/github/login`
4. 复制 Client ID 和 Client Secret

#### 前端配置

在 `projects/client` 目录下创建 `.env.local`:

```env
# API 地址
NEXT_PUBLIC_API_BASE_URL=http://localhost:3005
```

### 启动开发服务器

```bash
# 方式 1: 分别启动 (推荐用于调试)
# 终端 1 - 启动后端
pnpm dev:server

# 终端 2 - 启动前端
pnpm dev:client

# 方式 2: 从根目录启动
pnpm dev:server  # 后端: http://localhost:3005
pnpm dev:client  # 前端: http://localhost:3000
```

访问应用:
- 前端: [http://localhost:3000](http://localhost:3000)
- 后端 API: [http://localhost:3005/api](http://localhost:3005/api)

