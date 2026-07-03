/**
 * store/store.js 集成测试
 * 验证根 Store 正确组装三个模块 + 持久化插件
 */
import { describe, it, expect, beforeEach } from 'vitest';
import Vue from 'vue';
import store from '@/src/store/store.js';

// 确保 Vuex 已注册（store.js 内部执行了 Vue.use(Vuex)，
// 但如果 store.js 是 import 的单例，需验证可用性）
import Vuex from 'vuex';
Vue.use(Vuex);

describe('store/store.js', () => {
	beforeEach(() => {
		uni.clearStorageSync();
		// 重置 store 状态到初始值（通过 mutation）
		store.commit('m_cart/clearCart');
		store.commit('m_error/clearError');
		store.commit('m_user/updateToken', '');
		store.commit('m_user/cancelNotExistOrder');
	});

	describe('模块注册', () => {
		it('m_cart 模块存在且 state 包含 cart 和 buyNowGoods', () => {
			expect(store.state.m_cart).toBeDefined();
			expect(Array.isArray(store.state.m_cart.cart)).toBe(true);
			expect(store.state.m_cart.buyNowGoods).toBeNull();
		});

		it('m_user 模块存在且 state 包含 token 和 address', () => {
			expect(store.state.m_user).toBeDefined();
			expect(store.state.m_user.token).toBeDefined();
			expect(store.state.m_user.address).toBeDefined();
		});

		it('m_error 模块存在且 state 包含 hasError', () => {
			expect(store.state.m_error).toBeDefined();
			expect(store.state.m_error.hasError).toBe(false);
		});
	});

	describe('模块间独立工作', () => {
		it('cart commit 不影响 user state', () => {
			const before = store.state.m_user.token;
			store.commit('m_cart/addToCart', {
				goods_id: 1,
				goods_name: 'A',
				goods_price: 1000,
				goods_count: 1,
				goods_state: true
			});
			expect(store.state.m_user.token).toBe(before);
		});

		it('user commit 不影响 cart state', () => {
			store.commit('m_user/updateToken', 'secret');
			// cart 不受影响
			expect(store.state.m_cart.cart).toBeDefined();
		});

		it('error 模块独立响应', () => {
			store.commit('m_error/setError', { message: '错误' });
			expect(store.state.m_error.hasError).toBe(true);
			store.commit('m_error/clearError');
			expect(store.state.m_error.hasError).toBe(false);
		});
	});

	describe('持久化插件集成', () => {
		it('cart 操作自动写入 storage', () => {
			store.commit('m_cart/addToCart', {
				goods_id: 1,
				goods_name: '持久化测试',
				goods_price: 1000,
				goods_count: 1,
				goods_state: true
			});
			const stored = uni.getStorageSync('cart');
			expect(stored).not.toBe('');
			const parsed = JSON.parse(stored);
			expect(parsed).toHaveLength(1);
		});

		it('token 操作自动写入 storage', () => {
			store.commit('m_user/updateToken', 'Bearer new_token');
			const stored = uni.getStorageSync('token');
			// persist 插件对字符串类型直接存储原始值（不 JSON.stringify）
			expect(stored).toBe('Bearer new_token');
		});

		it('address 变更自动写入 storage', () => {
			store.commit('m_user/addAddress', {
				userName: '张三',
				telNumber: '13800138000',
				provinceName: '广东省'
			});
			const stored = JSON.parse(uni.getStorageSync('addressList'));
			expect(stored).toHaveLength(1);
			expect(stored[0].userName).toBe('张三');
		});
	});

	describe('getters 跨模块', () => {
		it('m_cart getters 正常工作', () => {
			store.commit('m_cart/addToCart', {
				goods_id: 1,
				goods_name: 'G',
				goods_price: 1000,
				goods_count: 3,
				goods_state: true
			});
			expect(store.getters['m_cart/total']).toBe(3);
		});

		it('m_user getters 正常工作', () => {
			store.commit('m_user/updateAddress', {
				provinceName: '浙江省',
				cityName: '杭州市',
				countyName: '西湖区',
				detailInfo: '文三路'
			});
			expect(store.getters['m_user/addstr']).toBe('浙江省杭州市西湖区文三路');
		});
	});
});
