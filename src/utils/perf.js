/**
 * 前端性能监控工具
 *
 * 提供命名计时、指标收集能力，用于开发阶段性能分析和生产环境采样上报。
 * 所有输出受 config/env.js 的 enablePerfLog 控制。
 */

import env from '@/src/config/env.js';

/** @type {Map<string, number>} */
const marks = new Map();

/** @type {Array<{ name: string, duration: number, timestamp: number }>} */
let metrics = [];

// ============ 计时 API ============

/**
 * 开始一个命名计时
 * @param {string} name 计时名称
 */
export function perfStart(name) {
	marks.set(name, Date.now());
}

/**
 * 结束一个命名计时
 * @param {string} name 计时名称
 * @returns {number} 耗时（ms），若未找到起始标记则返回 0
 */
export function perfEnd(name) {
	const start = marks.get(name);
	if (!start) return 0;
	const duration = Date.now() - start;
	marks.delete(name);

	if (env.enablePerfLog) {
		console.log(`[perf] ${name}: ${duration}ms`);
	}

	metrics.push({ name, duration, timestamp: Date.now() });
	return duration;
}

// ============ 指标管理 ============

/**
 * 获取已收集的性能指标（可用于上报）
 * @returns {Array<{ name: string, duration: number, timestamp: number }>}
 */
export function getMetrics() {
	return [...metrics];
}

/**
 * 清空已收集的指标
 */
export function clearMetrics() {
	metrics = [];
}

// ============ 请求计时快捷方法 ============

/**
 * 创建带计时包装的请求函数
 * 用于 request.js 拦截器，自动为每个请求计时
 *
 * @param {string} url 请求 URL
 * @returns {{ end: () => number }} 调用 end() 结束计时
 */
export function timeRequest(url) {
	// 缩短 URL 用于显示
	const shortUrl = url.replace(/^https?:\/\/[^/]+/, '').replace(/\?.*$/, '');
	perfStart(`req:${shortUrl}`);
	return {
		end() {
			return perfEnd(`req:${shortUrl}`);
		}
	};
}
