/**
 * mixins/tabbar-badge.js 单元测试
 * 覆盖：setBadge 逻辑（有/无 token、购物车数量、边界）、computed 映射、watch 触发
 */
// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import tabbarBadge from '@/src/mixins/tabbar-badge.js';

const localVue = createLocalVue();
localVue.use(Vuex);

const TestComponent = {
	template: '<view></view>',
	mixins: [tabbarBadge]
};

function createStore({ total = 0, token = '' } = {}) {
	return new Vuex.Store({
		modules: {
			m_cart: {
				namespaced: true,
				state: { cart: [] },
				getters: {
					total: () => total
				}
			},
			m_user: {
				namespaced: true,
				state: { token }
			}
		}
	});
}

function mountWith({ total = 0, token = '' } = {}) {
	return mount(TestComponent, {
		localVue,
		store: createStore({ total, token })
	});
}

describe('mixins/tabbar-badge.js', () => {
	describe('setBadge', () => {
		it('未登录时调用 removeTabBarBadge', () => {
			const removeSpy = vi.fn();
			uni.removeTabBarBadge = removeSpy;
			uni.setTabBarBadge = vi.fn();

			const wrapper = mountWith({ total: 5, token: '' });
			wrapper.vm.setBadge();

			expect(removeSpy).toHaveBeenCalledWith({ index: 2 });
			expect(uni.setTabBarBadge).not.toHaveBeenCalled();
		});

		it('已登录且 total=0 时调用 removeTabBarBadge', () => {
			const removeSpy = vi.fn();
			uni.removeTabBarBadge = removeSpy;
			uni.setTabBarBadge = vi.fn();

			const wrapper = mountWith({ total: 0, token: 'Bearer x' });
			wrapper.vm.setBadge();

			expect(removeSpy).toHaveBeenCalledWith({ index: 2 });
			expect(uni.setTabBarBadge).not.toHaveBeenCalled();
		});

		it('已登录且 total>0 时调用 setTabBarBadge 并传字符串 text', () => {
			const setSpy = vi.fn();
			uni.setTabBarBadge = setSpy;
			uni.removeTabBarBadge = vi.fn();

			const wrapper = mountWith({ total: 3, token: 'Bearer x' });
			wrapper.vm.setBadge();

			expect(setSpy).toHaveBeenCalledWith({ index: 2, text: '3' });
			expect(uni.removeTabBarBadge).not.toHaveBeenCalled();
		});

		it('total 为数值时 text 转为字符串', () => {
			const setSpy = vi.fn();
			uni.setTabBarBadge = setSpy;

			const wrapper = mountWith({ total: 99, token: 'Bearer y' });
			wrapper.vm.setBadge();

			expect(setSpy).toHaveBeenCalledWith(expect.objectContaining({ text: '99' }));
			expect(typeof setSpy.mock.calls[0][0].text).toBe('string');
		});
	});

	describe('computed 映射', () => {
		it('total 来自 m_cart/total getter', () => {
			const wrapper = mountWith({ total: 7, token: '' });
			expect(wrapper.vm.total).toBe(7);
		});

		it('token 来自 m_user/token state', () => {
			const wrapper = mountWith({ total: 0, token: 'abc' });
			expect(wrapper.vm.token).toBe('abc');
		});
	});

	describe('watch 触发', () => {
		it('token 变化时自动调用 setBadge', async () => {
			const removeSpy = vi.fn();
			uni.removeTabBarBadge = removeSpy;

			const store = createStore({ total: 5, token: '' });
			const wrapper = mount(TestComponent, { localVue, store });

			// 初始状态：无 token，setBadge 应在 onShow 中调用
			// 手动改变 token state 触发 watch
			store.state.m_user.token = 'new-token';
			await wrapper.vm.$nextTick();

			// token 变为有值 + total>0 → 应调 setTabBarBadge
			expect(uni.setTabBarBadge).toHaveBeenCalled();
		});
	});
});
