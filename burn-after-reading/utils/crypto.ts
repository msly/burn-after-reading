import { encodeHex, crypto, base64 } from "../deps.ts";

/**
 * 生成随机ID
 * @param length ID长度
 * @returns 随机ID字符串
 */
export function generateId(length = 16): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return encodeHex(bytes);
}

/**
 * 计算字符串的SHA-256哈希值
 * @param data 需要哈希的数据
 * @returns 哈希结果（十六进制）
 */
export async function sha256(data: string): Promise<string> {
  // 使用crypto.subtle API进行哈希计算
  const dataBuffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = new Uint8Array(hashBuffer);
  
  return encodeHex(hashArray);
}

/**
 * 验证密码
 * @param inputPassword 用户输入的密码
 * @param storedHash 存储的密码哈希
 * @returns 密码是否正确
 */
export async function verifyPassword(inputPassword: string, storedHash: string): Promise<boolean> {
  if (!inputPassword && !storedHash) {
    return true; // 都为空，视为无密码
  }
  
  if (!inputPassword || !storedHash) {
    return false; // 其中一个为空，另一个不为空
  }
  
  const inputHash = await sha256(inputPassword);
  return inputHash === storedHash;
}

/**
 * 哈希密码
 * @param password 明文密码
 * @returns 密码哈希
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) {
    return ""; // 空密码返回空字符串
  }
  return await sha256(password);
} 