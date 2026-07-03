/**
 * mixins/custom-navbar.js 单元测试
 * 覆盖：data 初始化、computed navBarTotalHeight、goBack 方法
 */
// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, createLocalVue } from '@vue/test-utils';
import customNavbar from '@/src/mixins/custom-navbar.js';

const localVue = createLocalVue();

const TestComponent = {
	template: '<view>{{ navBarTotalHeight }}</view>',
	mixins: [customNavbar]
};

describe('mixins/custom-navbar.js', () => {
	beforeEach(() => {
		// 重置 getSystemInfoSync mock
		uni.getSystemInfoSync = vi.fn(() => ({
			statusBarHeight: 20,
			windowWidth: 375,
			windowHeight: 667,
			platform: 'devtools'
		}));
	});

	describe('data 初始化', () => {
		it('statusBarHeight 从 uni.getSystemInfoSync 获取', () => {
			uni.getSystemInfoSync = vi.fn(() => ({
				statusBarHeight: 44,
				windowWidth: 375
			}));
			const wrapper = mount(TestComponent, { localVue });
			expect(wrapper.vm.statusBarHeight).toBe(44);
		});

		it('getSystemInfoSync 无 statusBarHeight 时降级为 0', () => {
			uni.getSystemInfoSync = vi.fn(() => ({}));
			const wrapper = mount(TestComponent, { localVue });
			expect(wrapper.vm.statusBarHeight).toBe(0);
		});

		it('navBarHeight 固定为 44', () => {
			const wrapper = mount(TestComponent, { localVue });
			expect(wrapper.vm.navBarHeight).toBe(44);
		});
	});

	describe('computed', () => {
		it('navBarTotalHeight = statusBarHeight + navBarHeight', () => {
			uni.getSystemInfoSync = vi.fn(() => ({ statusBarHeight: 20 }));
			const wrapper = mount(TestComponent, { localVue });
			expect(wrapper.vm.navBarTotalHeight).toBe(64); // 20 + 44
		});

		it('statusBarHeight 为 0 时 totalHeight 仍为 44', () => {
			uni.getSystemInfoSync = vi.fn(() => ({}));
			const wrapper = mount(TestComponent, { localVue });
			expect(wrapper.vm.navBarTotalHeight).toBe(44);
		});
	});

	describe('goBack', () => {
		it('调用 uni.navigateBack', () => {
			const navBackSpy = vi.fn();
			uni.navigateBack = navBackSpy;

			const wrapper = mount(TestComponent, { localVue });
			wrapper.vm.goBack();

			expect(navBackSpy).toHaveBeenCalled();
		});

		it('navigateBack 失败时 fallback 到 switchTab 前往首页', () => {
			// simulate fail callback
			let failCallback = null;
			uni.navigateBack = vi.fn(({ fail }) => {
				failCallback = fail;
			});
			const switchTabSpy = vi.fn();
			uni.switchTab = switchTabSpy;

			const wrapper = mount(TestComponent, { localVue });
			wrapper.vm.goBack();

			// 触发 fail 回调
			expect(failCallback).toBeTruthy();
			failCallback();

			expect(switchTabSpy).toHaveBeenCalledWith({ url: '/pages/home/home' });
		});
	});
});
