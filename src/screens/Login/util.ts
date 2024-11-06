import { sortBy } from 'lodash';

export function calculatePasswordStrength(str: string) {
  const password = sortBy(str).join('');
  let score = 0;

  // 密码长度
  if (password.length <= 4) {
    score += 0;
  } else if (password.length >= 5 && password.length <= 8) {
    score += 10;
  } else {
    score += 20;
  }

  // 字母
  if (/[A-Za-z]/.test(password)) {
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
      score += 20;
    } else {
      score += 10;
    }
  }

  // 数字
  if (/\d/.test(password)) {
    if (password.replace(/\D/g, '').length <= 2) {
      score += 10;
    } else {
      score += 15;
    }
  }

  // 符号
  if (/[\W_]/.test(password)) {
    if (password.replace(/[\w\s]/g, '').length === 1) {
      score += 10;
    } else {
      score += 20;
    }
  }

  // 字符重复
  if (/(\w)\1+/.test(password)) {
    score += 5;
  } else {
    score += 10;
  }

  // 整体
  if (
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[\W_]/.test(password)
  ) {
    score += 15;
  } else if (/[a-zA-Z]/.test(password) && /\d/.test(password) && /[\W_]/.test(password)) {
    score += 10;
  } else if (/[a-zA-Z]/.test(password) && /\d/.test(password) && !/[\W_]/.test(password)) {
    score += 5;
  }

  return score;
}
