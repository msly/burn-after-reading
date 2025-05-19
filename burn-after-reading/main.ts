import { Application, send, logger } from "./deps.ts";
import { contentRouter } from "./routes/mod.ts";
import { errorMiddleware } from "./middleware/error.ts";

// 创建应用实例
const app = new Application();

// 日志中间件
app.use(logger.logger);
app.use(logger.responseTime);

// 错误处理中间件
app.use(errorMiddleware);

// 路由
app.use(contentRouter.routes());
app.use(contentRouter.allowedMethods());

// 静态文件服务
app.use(async (ctx, next) => {
  try {
    // 如果是API请求则跳过
    if (ctx.request.url.pathname.startsWith("/api")) {
      return await next();
    }
    
    // 尝试提供静态文件
    const filePath = ctx.request.url.pathname;
    await send(ctx, filePath, {
      root: `${Deno.cwd()}/public`,
      index: "index.html",
    });
  } catch {
    // 如果文件不存在，则返回index.html（用于SPA路由）
    if (ctx.response.status === 404) {
      await send(ctx, "/", {
        root: `${Deno.cwd()}/public`,
        index: "index.html",
      });
    } else {
      await next();
    }
  }
});

// 启动服务器
const port = 8000;
console.log(`服务器启动在 http://localhost:${port}`);

await app.listen({ port }); 