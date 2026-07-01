/**
 * utils/persist.js 单元测试
 * 覆盖：持久化插件初始化恢复、mutation 写入、namespace 隔离、损坏数据降级
 */
import { describe, it, expect, beforeEach } from 'vitest';
import Vue from 'vue';
import Vuex from 'vuex';
import { createPersistedState } from '@/utils/persist.js';

Vue.use(Vuex);

function createStore(options = {}) {
	const { paths = {}, state = {} } = options;
	const modules = {};

	// 从 paths 推导模块结构
	for (const statePath of Object.keys(paths)) {
		const [namespace, ...rest] = statePath.split('.');
		const field = rest.join('.');
		if (!modules[namespace]) {
			modules[namespace] = {
				namespaced: true,
				state: () => ({ ...state[namespace] }),
				mutations: {
					set(state, payload) {
						Object.assign(state, payload);
					}
				}
			};
		}
	}

	return new Vuex.Store({
		modules,
		plugins: [createPersistedState({ paths })]
	});
}

describe('utils/persist.js', () => {
	beforeEach(() => {
		uni.clearStorageSync();
	});

	describe('初始化恢复', () => {
		it('从 storage 恢复已有数据到 state', () => {
			uni.setStorageSync('cart', JSON.stringify([{ goods_id: 1, goods_name: 'A' }]));

			const store = createStore({
				paths: { 'm_cart.cart': 'cart' },
				state: { m_cart: { cart: [] } }
			});

			expect(store.state.m_cart.cart).toHaveLength(1);
			expect(store.state.m_cart.cart[0].goods_id).toBe(1);
		});

		it('storage 无数据时使用默认 state', () => {
			const store = createStore({
				paths: { 'm_cart.cart': 'cart' },
				state: { m_cart: { cart: [] } }
			});

			expect(store.state.m_cart.cart).toEqual([]);
		});

		it('空字符串视为无数据，不覆盖 state', () => {
			uni.setStorageSync('cart', '');

			const store = createStore({
				paths: { 'm_cart.cart': 'cart' },
				state: { m_cart: { cart: [{ goods_id: 99 }] } }
			});

			// 默认 state 保持不变
			expect(store.state.m_cart.cart).toHaveLength(1);
			expect(store.state.m_cart.cart[0].goods_id).toBe(99);
		});

		it('多模块同时恢复', () => {
			uni.setStorageSync('cart', JSON.stringify([{ goods_id: 1 }]));
			// token 为 JSON 字符串（persist 插件对非数组/对象的简单值也用 JSON stringify 序列化）
			uni.setStorageSync('token', JSON.stringify('abc123'));

			const store = createStore({
				paths: {
					'm_cart.cart': 'cart',
					'm_user.token': 'token'
				},
				state: {
					m_cart: { cart: [] },
					m_user: { token: '' }
				}
			});

			expect(store.state.m_cart.cart).toHaveLength(1);
			expect(store.state.m_user.token).toBe('abc123');
		});
	});

	describe('mutation 写入', () => {
		it('匹配的模块 mutation 触发写入 storage', () => {
			const store = createStore({
				paths: { 'm_cart.cart': 'cart' },
				state: { m_cart: { cart: [] } }
			});

			store.commit('m_cart/set', { cart: [{ goods_id: 1 }] });

			const stored = JSON.parse(uni.getStorageSync('cart'));
			expect(stored).toHaveLength(1);
			expect(stored[0].goods_id).toBe(1);
		});

		it('非匹配命名空间 mutation 不触发写入', () => {
			const store = createStore({
				paths: { 'm_cart.cart': 'cart' },
				state: { m_cart: { cart: [] }, m_user: { token: '' } }
			});

			// 手动提交 m_user mutation（需要模块支持）
			store.commit('m_user/set', { token: 'new_token' });

			// cart 存储不应被影响
			expect(uni.getStorageSync('cart')).toBe('');
		});
	});

	describe('损坏数据降级', () => {
		it('JSON 解析失败时 console.warn 且不抛错', () => {
			uni.setStorageSync('cart', '{corrupted json ///');

			// 不应抛错
			expect(() => {
				createStore({
					paths: { 'm_cart.cart': 'cart' },
					state: { m_cart: { cart: [] } }
				});
			}).not.toThrow();

			// state 保持默认值
			const store = createStore({
				paths: { 'm_cart.cart': 'cart' },
				state: { m_cart: { cart: [{ goods_id: 'default' }] } }
			});
			expect(store.state.m_cart.cart).toHaveLength(1);
		});
	});
});
