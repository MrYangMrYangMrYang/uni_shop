/**
 * mixins/error-boundary.js 单元测试
 *
 * 覆盖 withErrorBoundary / retry / pageError / onPullDownRefresh
 */
// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import Vue from 'vue';
import Vuex from 'vuex';
import { createLocalVue, mount } from '@vue/test-utils';
import errorBoundary from '@/src/mixins/error-boundary.js';
import errorModule from '@/src/store/error.js';

Vue.use(Vuex);

const TestComponent = {
	template: '<view></view>',
	mixins: [errorBoundary]
};

function createStore() {
	return new Vuex.Store({
		modules: {
			m_error: {
				...errorModule
			}
		}
	});
}

function mountComponent(store) {
	const localVue = createLocalVue();
	return mount(TestComponent, { localVue, store });
}

describe('mixins/error-boundary.js', () => {
	let store;
	let wrapper;

	beforeEach(() => {
		store = createStore();
		wrapper = mountComponent(store);
	});

	describe('computed', () => {
		it('pageError 默认 false', () => {
			expect(wrapper.vm.pageError).toBe(false);
		});

		it('isPageNetworkError 默认 false', () => {
			expect(wrapper.vm.isPageNetworkError).toBe(false);
		});

		it('pageError 反映 store 中 hasError', () => {
			store.commit('m_error/setError', { message: '错了' });
			expect(wrapper.vm.pageError).toBe(true);
		});

		it('isPageNetworkError 反映 store 中 isNetworkError', () => {
			store.commit('m_error/setError', { message: '断了', isNetwork: true });
			expect(wrapper.vm.isPageNetworkError).toBe(true);
		});
	});

	describe('withErrorBoundary', () => {
		it('成功时返回结果且不设置错误', async () => {
			const fn = vi.fn().mockResolvedValue({ data: 'ok' });

			const result = await wrapper.vm.withErrorBoundary(fn);

			expect(result).toEqual({ data: 'ok' });
			expect(store.state.m_error.hasError).toBe(false);
		});

		it('失败时设置错误状态并返回 undefined', async () => {
			const fn = vi.fn().mockRejectedValue(new Error('boom'));

			const result = await wrapper.vm.withErrorBoundary(fn);

			expect(result).toBeUndefined();
			expect(store.state.m_error.hasError).toBe(true);
		});

		it('网络 timeout 错误标记为 isNetworkError', async () => {
			const err = { errMsg: 'request:fail timeout' };
			const fn = vi.fn().mockRejectedValue(err);

			await wrapper.vm.withErrorBoundary(fn);

			expect(store.state.m_error.isNetworkError).toBe(true);
			expect(store.state.m_error.errorMessage).toBe('网络连接失败，请检查网络');
		});

		it('网络 fail 错误标记为 isNetworkError', async () => {
			const err = { errMsg: 'request:fail' };
			const fn = vi.fn().mockRejectedValue(err);

			await wrapper.vm.withErrorBoundary(fn);

			expect(store.state.m_error.isNetworkError).toBe(true);
		});

		it('非网络错误使用自定义 errorMessage', async () => {
			const fn = vi.fn().mockRejectedValue(new Error('500'));

			await wrapper.vm.withErrorBoundary(fn, { errorMessage: '首页加载失败' });

			expect(store.state.m_error.isNetworkError).toBe(false);
			expect(store.state.m_error.errorMessage).toBe('首页加载失败');
		});

		it('保存 fetchFn 引用供 retry 使用', async () => {
			const fn = vi.fn().mockRejectedValue(new Error('fail'));

			await wrapper.vm.withErrorBoundary(fn);

			expect(wrapper.vm.__retryFn).toBe(fn);
		});

		it('调用前先清除旧错误状态', async () => {
			store.commit('m_error/setError', { message: '旧错误' });
			const fn = vi.fn().mockResolvedValue('ok');

			await wrapper.vm.withErrorBoundary(fn);

			expect(store.state.m_error.hasError).toBe(false);
		});
	});

	describe('retry', () => {
		it('有保存的 fetchFn 且有错误时执行重试', async () => {
			let callCount = 0;
			const fn = vi.fn().mockImplementation(() => {
				callCount++;
				if (callCount === 1) return Promise.reject(new Error('fail'));
				return Promise.resolve('recovered');
			});

			await wrapper.vm.withErrorBoundary(fn);
			expect(store.state.m_error.hasError).toBe(true);

			await wrapper.vm.retry();
			// retry() 内部调用 withErrorBoundary，成功后 store 错误被清除
			expect(store.state.m_error.hasError).toBe(false);
		});

		it('无错误时不执行重试', async () => {
			wrapper.vm.__retryFn = vi.fn().mockResolvedValue('ok');
			await wrapper.vm.retry();
			expect(wrapper.vm.__retryFn).not.toHaveBeenCalled();
		});

		it('无保存函数时不抛错', async () => {
			store.commit('m_error/setError', { message: '错' });
			wrapper.vm.__retryFn = null;
			await expect(wrapper.vm.retry()).resolves.toBeUndefined();
		});
	});
});
