import { Context, Status } from "../deps.ts";

/**
 * 错误处理中间件
 */
export async function errorMiddleware(ctx: Context, next: () => Promise<unknown>) {
  try {
    await next();
  } catch (err) {
    console.error("请求处理错误:", err);
    
    // 设置响应状态码和错误信息
    ctx.response.status = Status.InternalServerError;
    ctx.response.body = {
      error: "服务器内部错误",
      message: err.message
    };
  }
} 