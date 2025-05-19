# 阅后即焚 - 安全分享敏感信息

一个简单的阅后即焚应用，允许用户创建加密内容，并在查看后或过期后自动销毁。

## 功能特点

- 🔒 密码保护 - 为内容设置访问密码
- ⏱️ 有效期限制 - 设置内容的有效期
- 👁️ 查看次数限制 - 限制内容的最大查看次数
- 🔥 阅后即焚 - 内容在查看后或过期后自动销毁
- 📱 响应式设计 - 适配桌面和移动设备

## 技术栈

- 前端：HTML, CSS, JavaScript (原生)
- 后端：Deno + Oak 框架
- 数据存储：内存缓存 (可升级到 Deno KV)

## 本地开发

### 前提条件

- [Deno](https://deno.land/#installation) 1.30 或更高版本

### 启动开发服务器

```bash
# 进入项目目录
cd burn-after-reading

# 启动开发服务器（支持热重载）
deno task dev
```

然后在浏览器中访问 http://localhost:8000

## 部署到 Deno Deploy

1. 创建一个 [Deno Deploy](https://deno.com/deploy) 账号
2. 创建新项目，并连接到您的 GitHub 仓库
3. 配置项目：
   - 入口文件: `main.ts`
   - 环境变量: 根据需要设置

## 项目结构

```
burn-after-reading/
  ├── public/            # 静态文件
  │   ├── index.html     # 前端页面
  │   ├── styles.css     # 样式表
  │   └── scripts.js     # 前端脚本
  ├── routes/            # API 路由
  │   ├── mod.ts         # 路由导出
  │   └── content.ts     # 内容相关 API
  ├── services/          # 业务逻辑
  │   └── content.ts     # 内容服务
  ├── models/            # 数据模型
  │   └── content.ts     # 内容模型
  ├── utils/             # 工具函数
  │   └── crypto.ts      # 加密工具
  ├── middleware/        # 中间件
  │   └── error.ts       # 错误处理
  ├── deps.ts            # 依赖管理
  ├── main.ts            # 主入口
  ├── deno.json          # Deno 配置
  └── README.md          # 文档
```

## 安全性说明

- 此应用使用内存存储，重启服务器后数据会丢失
- 在生产环境中推荐使用 Deno KV 进行数据持久化
- 密码使用 SHA-256 哈希存储，但未使用盐值
- 为提高安全性，可以添加 HTTPS、速率限制等功能

## 许可

MIT 