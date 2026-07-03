/**
 * config/env.js 单元测试
 * 覆盖：development/production 配置分支、未知环境降级、布尔标志
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('config/env.js', () => {
	beforeEach(() => {
		// 重置模块缓存以每次重新加载 env.js
		vi.resetModules();
	});

	it('development 环境：enableLog 和 enablePerfLog 为 true', async () => {
		vi.stubEnv('NODE_ENV', 'development');
		const env = await import('@/src/config/env.js');
		expect(env.isDev).toBe(true);
		expect(env.isProd).toBe(false);
		expect(env.enableLog).toBe(true);
		expect(env.enablePerfLog).toBe(true);
	});

	it('production 环境：enableLog 和 enablePerfLog 为 false', async () => {
		vi.stubEnv('NODE_ENV', 'production');
		const env = await import('@/src/config/env.js');
		expect(env.isDev).toBe(false);
		expect(env.isProd).toBe(true);
		expect(env.enableLog).toBe(false);
		expect(env.enablePerfLog).toBe(false);
	});

	it('未设置 NODE_ENV 时默认为 development', async () => {
		// vi.stubEnv 将 undefined 转为字符串 'undefined'，这里移除 key 来模拟未设置
		delete process.env.NODE_ENV;
		const env = await import('@/src/config/env.js');
		expect(env.env).toBe('development');
		expect(env.isDev).toBe(true);
		// 恢复供后续测试使用
		vi.stubEnv('NODE_ENV', 'development');
	});

	it('未知环境时降级到 development 配置', async () => {
		vi.stubEnv('NODE_ENV', 'staging');
		const env = await import('@/src/config/env.js');
		expect(env.env).toBe('staging');
		// 降级为 development
		expect(env.enableLog).toBe(true);
		expect(env.enablePerfLog).toBe(true);
	});

	it('所有环境 apiBaseUrl 均正确导出', async () => {
		vi.stubEnv('NODE_ENV', 'development');
		const env = await import('@/src/config/env.js');
		expect(env.apiBaseUrl).toBe('https://api-hmugo-web.itheima.net');
	});

	it('requestTimeout 均为 60000', async () => {
		vi.stubEnv('NODE_ENV', 'production');
		const env = await import('@/src/config/env.js');
		expect(env.requestTimeout).toBe(60000);
	});

	it('生产环境包含 perfSampleRate', async () => {
		vi.stubEnv('NODE_ENV', 'production');
		const env = await import('@/src/config/env.js');
		expect(env.perfSampleRate).toBe(0.1);
	});
});
