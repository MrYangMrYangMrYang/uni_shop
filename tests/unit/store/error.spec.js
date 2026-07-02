import Vue from 'vue';
/**
 * store/error.js 单元测试
 *
 * m_error 模块管理全局错误状态，供 error-boundary mixin 消费。
 * 不持久化 — 每次页面加载时重置。
 */
import { describe, it, expect, beforeEach } from 'vitest';
import Vuex from 'vuex';

Vue.use(Vuex);
import errorModule from '@/src/store/error.js';

function createStore() {
	return new Vuex.Store({
		modules: {
			m_error: {
				...errorModule
			}
		}
	});
}

describe('store/error.js', () => {
	let store;

	beforeEach(() => {
		store = createStore();
	});

	describe('state 初始值', () => {
		it('hasError 默认 false', () => {
			expect(store.state.m_error.hasError).toBe(false);
		});

		it('errorMessage 默认空字符串', () => {
			expect(store.state.m_error.errorMessage).toBe('');
		});

		it('isNetworkError 默认 false', () => {
			expect(store.state.m_error.isNetworkError).toBe(false);
		});
	});

	describe('mutation setError', () => {
		it('设置错误状态为 true', () => {
			store.commit('m_error/setError', { message: '网络异常' });
			expect(store.state.m_error.hasError).toBe(true);
		});

		it('存储自定义错误消息', () => {
			store.commit('m_error/setError', { message: '服务器 500' });
			expect(store.state.m_error.errorMessage).toBe('服务器 500');
		});

		it('标记为网络错误', () => {
			store.commit('m_error/setError', { message: '超时', isNetwork: true });
			expect(store.state.m_error.isNetworkError).toBe(true);
		});

		it('未传 isNetwork 时默认为 false', () => {
			store.commit('m_error/setError', { message: '错误' });
			expect(store.state.m_error.isNetworkError).toBe(false);
		});

		it('未传 message 时使用默认文案', () => {
			store.commit('m_error/setError');
			expect(store.state.m_error.errorMessage).toBe('数据加载失败，请稍后重试');
			expect(store.state.m_error.hasError).toBe(true);
		});

		it('空对象参数不抛错', () => {
			store.commit('m_error/setError', {});
			expect(store.state.m_error.hasError).toBe(true);
			expect(store.state.m_error.errorMessage).toBe('数据加载失败，请稍后重试');
		});

		it('无 payload 不抛错', () => {
			expect(() => store.commit('m_error/setError')).not.toThrow();
		});
	});

	describe('mutation clearError', () => {
		it('清除 hasError', () => {
			store.commit('m_error/setError', { message: '错误' });
			store.commit('m_error/clearError');
			expect(store.state.m_error.hasError).toBe(false);
		});

		it('清除 errorMessage', () => {
			store.commit('m_error/setError', { message: '错误' });
			store.commit('m_error/clearError');
			expect(store.state.m_error.errorMessage).toBe('');
		});

		it('清除 isNetworkError', () => {
			store.commit('m_error/setError', { message: '网络', isNetwork: true });
			store.commit('m_error/clearError');
			expect(store.state.m_error.isNetworkError).toBe(false);
		});

		it('无错误时清除也不抛错', () => {
			expect(() => store.commit('m_error/clearError')).not.toThrow();
		});
	});
});
