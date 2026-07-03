/**
 * utils/perf.js 单元测试
 * 覆盖：perfStart / perfEnd 计时、getMetrics / clearMetrics 指标管理、timeRequest 快捷方法
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// mock env 模块控制 enablePerfLog
vi.mock('@/src/config/env.js', () => ({
	default: { enablePerfLog: false }
}));

import { perfStart, perfEnd, getMetrics, clearMetrics, timeRequest } from '@/src/utils/perf.js';

describe('utils/perf.js', () => {
	beforeEach(() => {
		clearMetrics();
	});

	describe('perfStart / perfEnd', () => {
		it('perfEnd 返回合理的正耗时', () => {
			perfStart('test-op');
			const duration = perfEnd('test-op');
			expect(duration).toBeGreaterThanOrEqual(0);
		});

		it('未匹配的 perfEnd 返回 0', () => {
			const duration = perfEnd('never-started');
			expect(duration).toBe(0);
		});

		it('同一名称多次 start 以最后一次为准', () => {
			perfStart('dup');
			perfStart('dup'); // 覆盖
			const d = perfEnd('dup');
			expect(d).toBeGreaterThanOrEqual(0);
			// 第二次 perfEnd 应找不到（已被 delete）
			expect(perfEnd('dup')).toBe(0);
		});

		it('多次计时互不干扰', () => {
			perfStart('a');
			perfStart('b');
			const db = perfEnd('b');
			const da = perfEnd('a');
			expect(da).toBeGreaterThanOrEqual(db); // a 比 b 先开始，所以 a >= b
		});
	});

	describe('getMetrics / clearMetrics', () => {
		it('getMetrics 初始返回空数组', () => {
			expect(getMetrics()).toEqual([]);
		});

		it('计次结束后 getMetrics 包含记录', () => {
			perfStart('feature');
			const duration = perfEnd('feature');
			const metrics = getMetrics();
			expect(metrics).toHaveLength(1);
			expect(metrics[0].name).toBe('feature');
			expect(metrics[0].duration).toBe(duration);
			expect(metrics[0].timestamp).toBeGreaterThan(0);
		});

		it('clearMetrics 清空所有记录', () => {
			perfStart('x');
			perfEnd('x');
			expect(getMetrics()).toHaveLength(1);
			clearMetrics();
			expect(getMetrics()).toEqual([]);
		});

		it('getMetrics 返回的是副本而非引用', () => {
			perfStart('x');
			perfEnd('x');
			const copy = getMetrics();
			copy.push({ name: 'injected', duration: 0, timestamp: 0 });
			expect(getMetrics()).toHaveLength(1);
		});
	});

	describe('timeRequest', () => {
		it('timeRequest 返回带 end() 的对象', () => {
			const timer = timeRequest('https://api.example.com/v1/goods/search?q=test');
			expect(timer).toHaveProperty('end');
			expect(typeof timer.end).toBe('function');
		});

		it('end() 返回计次耗时', () => {
			const timer = timeRequest('https://api.example.com/api/public/v1/home/swiperdata');
			const duration = timer.end();
			expect(duration).toBeGreaterThanOrEqual(0);
		});

		it('URL 中的协议和域名被截短', () => {
			// timeRequest 截去协议+域名，只保留路径部分用于 metric name
			const timer = timeRequest('https://api-hmugo-web.itheima.net/api/public/v1/goods/detail?goods_id=1');
			timer.end();
			const metrics = getMetrics();
			expect(metrics[0].name).toBe('req:/api/public/v1/goods/detail');
		});
	});
});
