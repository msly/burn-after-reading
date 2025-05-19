import { hashPassword } from "../utils/crypto.ts";

/**
 * 内容模型接口
 */
export interface Content {
  id: string;
  content: string;
  passwordHash: string;
  maxViews: number;
  viewCount: number;
  createdAt: Date;
  expiresAt: Date;
  isDestroyed: boolean;
}

/**
 * 创建内容参数
 */
export interface CreateContentParams {
  id: string;
  content: string;
  password?: string;
  maxViews: number;
  expirySeconds: number;
  passwordHash?: string;
}

/**
 * 创建新内容
 */
export function createContent(params: CreateContentParams): Content {
  const { id, content, passwordHash = "", maxViews, expirySeconds } = params;
  
  const now = new Date();
  // 如果expirySeconds为0，则设置一个很远的未来日期（实际上不会过期）
  const expiresAt = expirySeconds > 0 
    ? new Date(now.getTime() + expirySeconds * 1000) 
    : new Date(now.getTime() + 1000 * 60 * 60 * 24 * 365 * 10); // 10年后，实际上不会过期
  
  return {
    id,
    content,
    passwordHash,
    maxViews,
    viewCount: 0,
    createdAt: now,
    expiresAt,
    isDestroyed: false
  };
}

/**
 * 检查内容是否过期
 */
export function isContentExpired(content: Content): boolean {
  return content.expiresAt < new Date() || content.isDestroyed;
}

/**
 * 检查内容是否需要密码
 */
export function isContentPasswordProtected(content: Content): boolean {
  return !!content.passwordHash;
}

/**
 * 增加内容查看次数
 */
export function incrementViewCount(content: Content): Content {
  content.viewCount += 1;
  
  // 如果达到最大查看次数，标记为已销毁
  if (content.viewCount >= content.maxViews) {
    content.isDestroyed = true;
  }
  
  return content;
}

/**
 * 销毁内容
 */
export function destroyContent(content: Content): Content {
  content.isDestroyed = true;
  return content;
}

/**
 * 内容摘要信息（不包含实际内容）
 */
export interface ContentInfo {
  id: string;
  isPasswordProtected: boolean;
  remainingViews: number;
  isExpired: boolean;
  isDestroyed: boolean;
}

/**
 * 获取内容摘要信息
 */
export function getContentInfo(content: Content): ContentInfo {
  return {
    id: content.id,
    isPasswordProtected: isContentPasswordProtected(content),
    remainingViews: Math.max(0, content.maxViews - content.viewCount),
    isExpired: isContentExpired(content),
    isDestroyed: content.isDestroyed
  };
} 