import { Router, Status } from "../deps.ts";
import { ContentService } from "../services/content.ts";

// 实例化内容服务
const contentService = new ContentService();

// 创建路由
const router = new Router();

// 创建内容
router.post("/api/content", async (ctx) => {
  try {
    const body = await ctx.request.body().value;
    
    if (!body || typeof body !== "object") {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = { error: "请求格式错误" };
      return;
    }
    
    const { content, password = "", expiryHours = 24, maxViews = 1 } = body;
    
    if (!content || content.trim().length === 0) {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = { error: "内容不能为空" };
      return;
    }
    
    // 创建内容
    const newContent = await contentService.createContent(
      content,
      password,
      Number(expiryHours),
      Number(maxViews)
    );
    
    // 返回成功结果
    ctx.response.status = Status.Created;
    ctx.response.body = {
      id: newContent.id,
      maxViews: newContent.maxViews,
      expiryHours: expiryHours
    };
    
  } catch (error) {
    console.error("创建内容失败:", error);
    
    ctx.response.status = Status.InternalServerError;
    ctx.response.body = { error: "创建内容失败" };
  }
});

// 获取内容信息
router.get("/api/content/:id/info", (ctx) => {
  try {
    const id = ctx.params.id;
    
    if (!id) {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = { error: "ID不能为空" };
      return;
    }
    
    // 获取内容信息
    const contentInfo = contentService.getContentInfo(id);
    
    if (!contentInfo) {
      ctx.response.status = Status.NotFound;
      ctx.response.body = { error: "内容不存在或已过期" };
      return;
    }
    
    // 返回内容信息
    ctx.response.status = Status.OK;
    ctx.response.body = contentInfo;
    
  } catch (error) {
    console.error("获取内容信息失败:", error);
    
    ctx.response.status = Status.InternalServerError;
    ctx.response.body = { error: "获取内容信息失败" };
  }
});

// 查看内容
router.post("/api/content/:id", async (ctx) => {
  try {
    const id = ctx.params.id;
    
    if (!id) {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = { error: "ID不能为空" };
      return;
    }
    
    // 获取请求体中的密码
    const body = await ctx.request.body().value;
    const password = (body && body.password) ? body.password : "";
    
    // 查看内容
    const content = await contentService.viewContent(id, password);
    
    if (!content) {
      const info = contentService.getContentInfo(id);
      
      // 根据情况返回不同的错误
      if (!info) {
        ctx.response.status = Status.NotFound;
        ctx.response.body = { error: "内容不存在或已过期" };
      } else if (info.isDestroyed) {
        ctx.response.status = Status.Gone;
        ctx.response.body = { error: "内容已销毁" };
      } else {
        ctx.response.status = Status.Unauthorized;
        ctx.response.body = { error: "密码错误" };
      }
      return;
    }
    
    // 返回内容
    ctx.response.status = Status.OK;
    ctx.response.body = {
      content: content.content,
      remainingViews: Math.max(0, content.maxViews - content.viewCount)
    };
    
  } catch (error) {
    console.error("查看内容失败:", error);
    
    ctx.response.status = Status.InternalServerError;
    ctx.response.body = { error: "查看内容失败" };
  }
});

// 销毁内容
router.delete("/api/content/:id", (ctx) => {
  try {
    const id = ctx.params.id;
    
    if (!id) {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = { error: "ID不能为空" };
      return;
    }
    
    // 尝试销毁内容
    const result = contentService.destroyContent(id);
    
    if (!result) {
      ctx.response.status = Status.NotFound;
      ctx.response.body = { error: "内容不存在或已过期" };
      return;
    }
    
    // 返回成功
    ctx.response.status = Status.OK;
    ctx.response.body = { message: "内容已成功销毁" };
    
  } catch (error) {
    console.error("销毁内容失败:", error);
    
    ctx.response.status = Status.InternalServerError;
    ctx.response.body = { error: "销毁内容失败" };
  }
});

// 定期清理过期内容
setInterval(() => {
  const count = contentService.cleanupExpiredContent();
  if (count > 0) {
    console.log(`已清理 ${count} 个过期内容`);
  }
}, 60 * 60 * 1000); // 每小时清理一次

export default router; 