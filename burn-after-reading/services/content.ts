import { generateId } from "../utils/crypto.ts";
import {
  Content,
  CreateContentParams,
  createContent,
  destroyContent,
  getContentInfo,
  incrementViewCount,
  isContentExpired,
  isContentPasswordProtected,
  ContentInfo,
} from "../models/content.ts";
import { verifyPassword, hashPassword } from "../utils/crypto.ts";

// 使用内存存储，在实际应用中可以替换为Deno KV
const contentStore = new Map<string, Content>();

/**
 * 内容服务
 */
export class ContentService {
  /**
   * 创建新内容
   */
  async createContent(
    content: string,
    password: string,
    expirySeconds: number,
    maxViews: number
  ): Promise<Content> {
    const id = generateId();
    
    // 合法性检查
    if (!content || content.trim().length === 0) {
      throw new Error("内容不能为空");
    }
    
    // expirySeconds可以为0，表示不限制过期时间
    if (expirySeconds < 0) {
      throw new Error("有效期必须大于或等于0秒");
    }
    
    if (maxViews <= 0) {
      throw new Error("查看次数必须大于0次");
    }
    
    // 计算密码哈希
    const passwordHash = await hashPassword(password);
    
    // 创建内容
    const params: CreateContentParams = {
      id,
      content,
      passwordHash,
      maxViews,
      expirySeconds
    };
    
    const newContent = createContent(params);
    contentStore.set(id, newContent);
    
    return newContent;
  }
  
  /**
   * 根据ID获取内容
   */
  getContent(id: string): Content | null {
    const content = contentStore.get(id);
    
    if (!content) {
      return null;
    }
    
    // 如果内容已过期，删除并返回null
    if (isContentExpired(content)) {
      this.deleteContent(id);
      return null;
    }
    
    return content;
  }
  
  /**
   * 获取内容信息（不包含实际内容）
   */
  getContentInfo(id: string): ContentInfo | null {
    const content = this.getContent(id);
    
    if (!content) {
      return null;
    }
    
    return getContentInfo(content);
  }
  
  /**
   * 查看内容（需要验证密码）
   */
  async viewContent(id: string, password: string): Promise<Content | null> {
    const content = this.getContent(id);
    
    if (!content) {
      return null;
    }
    
    // 验证密码
    if (isContentPasswordProtected(content) && !(await verifyPassword(password, content.passwordHash))) {
      return null;
    }
    
    // 增加查看次数
    const updatedContent = incrementViewCount(content);
    contentStore.set(id, updatedContent);
    
    return updatedContent;
  }
  
  /**
   * 手动销毁内容
   */
  destroyContent(id: string): boolean {
    const content = contentStore.get(id);
    
    if (!content) {
      return false;
    }
    
    const destroyed = destroyContent(content);
    contentStore.set(id, destroyed);
    
    return true;
  }
  
  /**
   * 删除内容
   */
  deleteContent(id: string): boolean {
    return contentStore.delete(id);
  }
  
  /**
   * 清理过期内容
   */
  cleanupExpiredContent(): number {
    let count = 0;
    
    for (const [id, content] of contentStore.entries()) {
      if (isContentExpired(content)) {
        contentStore.delete(id);
        count++;
      }
    }
    
    return count;
  }
} 