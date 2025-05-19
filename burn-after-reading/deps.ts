// 标准库依赖 - 使用较新的模块结构
// HTTP 相关
export { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Oak框架（使用其内置的HTTP状态码）
export {
  Application,
  Context,
  Router,
  send,
  Status // Oak提供了自己的状态码实现
} from "https://deno.land/x/oak@v12.5.0/mod.ts";

export type {
  RouterContext,
  RouterMiddleware
} from "https://deno.land/x/oak@v12.5.0/mod.ts";

// 编码工具 - 更新的API
export * as base64 from "https://deno.land/std@0.224.0/encoding/base64.ts";
export { encodeHex } from "https://deno.land/std@0.224.0/encoding/hex.ts";

// 加密工具 - 使用新的API
// 注意：crypto模块结构在新版本中可能有变化
export { crypto } from "https://deno.land/std@0.224.0/crypto/mod.ts";

// 日志工具
export { default as logger } from "https://deno.land/x/oak_logger@1.0.0/mod.ts"; 