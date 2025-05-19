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
    const filePath = ctx.request.url.pathname === "/" 
      ? "/index.html" 
      : ctx.request.url.pathname;
      
    await send(ctx, filePath, {
      root: `${Deno.cwd()}/public`,
    });
  } catch (error) {
    // 如果文件不存在，则返回index.html（用于SPA路由）
    if (ctx.response.status === 404) {
      try {
        await send(ctx, "/index.html", {
          root: `${Deno.cwd()}/public`,
        });
      } catch (err) {
        console.error("Error serving index.html:", err);
        await next();
      }
    } else {
      console.error("Error serving static file:", error);
      await next();
    }
  }
});

// 添加一个简单的根路由处理
app.use(async (ctx) => {
  // 如果所有中间件都未处理请求，则返回 404
  if (!ctx.response.body) {
    ctx.response.status = 404;
    ctx.response.body = {
      error: "Not Found",
      message: "The requested resource was not found on this server."
    };
  }
});

// 启动服务器
const port = 8000;
console.log(`服务器启动在 http://localhost:${port}`);

await app.listen({ port }); 