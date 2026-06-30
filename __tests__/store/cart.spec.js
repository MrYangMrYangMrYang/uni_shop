import { describe, it, expect, beforeEach } from 'vitest';
import Vue from 'vue';
import Vuex from 'vuex';
import cartModule from '@/store/cart.js';
import { createPersistedState } from '@/utils/persist.js';

Vue.use(Vuex);

// 创建一个仅含 m_cart 模块的测试用 store（接入持久化插件）
function createStore() {
	return new Vuex.Store({
		modules: { m_cart: { ...cartModule, namespaced: true } },
		plugins: [
			createPersistedState({
				paths: { 'm_cart.cart': 'cart' }
			})
		]
	});
}

describe('store/cart.js', () => {
	let store;

	beforeEach(() => {
		uni.clearStorageSync();
		store = createStore();
	});

	describe('mutations', () => {
		it('addToCart 新增商品时推入新对象', () => {
			const goods = { goods_id: 1, goods_name: '商品A', goods_price: 10, goods_count: 1, goods_state: true };
			store.commit('m_cart/addToCart', goods);
			expect(store.state.m_cart.cart).toHaveLength(1);
			expect(store.state.m_cart.cart[0].goods_id).toBe(1);
		});

		it('addToCart 已存在商品时数量 +1', () => {
			const goods = { goods_id: 1, goods_name: '商品A', goods_price: 10, goods_count: 1, goods_state: true };
			store.commit('m_cart/addToCart', goods);
			store.commit('m_cart/addToCart', goods);
			expect(store.state.m_cart.cart).toHaveLength(1);
			expect(store.state.m_cart.cart[0].goods_count).toBe(2);
		});

		it('removeGoodsById 正确移除指定商品', () => {
			store.commit('m_cart/addToCart', {
				goods_id: 1,
				goods_name: 'A',
				goods_price: 10,
				goods_count: 1,
				goods_state: true
			});
			store.commit('m_cart/addToCart', {
				goods_id: 2,
				goods_name: 'B',
				goods_price: 20,
				goods_count: 1,
				goods_state: true
			});
			store.commit('m_cart/removeGoodsById', 1);
			expect(store.state.m_cart.cart).toHaveLength(1);
			expect(store.state.m_cart.cart[0].goods_id).toBe(2);
		});

		it('updateAllGoodsState 批量更新勾选状态', () => {
			store.commit('m_cart/addToCart', {
				goods_id: 1,
				goods_name: 'A',
				goods_price: 10,
				goods_count: 1,
				goods_state: true
			});
			store.commit('m_cart/addToCart', {
				goods_id: 2,
				goods_name: 'B',
				goods_price: 20,
				goods_count: 1,
				goods_state: false
			});
			store.commit('m_cart/updateAllGoodsState', true);
			expect(store.state.m_cart.cart.every(x => x.goods_state)).toBe(true);
		});

		it('removeCheckedGoods 仅保留未勾选商品', () => {
			store.commit('m_cart/addToCart', {
				goods_id: 1,
				goods_name: 'A',
				goods_price: 10,
				goods_count: 1,
				goods_state: true
			});
			store.commit('m_cart/addToCart', {
				goods_id: 2,
				goods_name: 'B',
				goods_price: 20,
				goods_count: 1,
				goods_state: false
			});
			store.commit('m_cart/removeCheckedGoods');
			expect(store.state.m_cart.cart).toHaveLength(1);
			expect(store.state.m_cart.cart[0].goods_id).toBe(2);
		});

		it('clearCart 清空购物车', () => {
			store.commit('m_cart/addToCart', {
				goods_id: 1,
				goods_name: 'A',
				goods_price: 10,
				goods_count: 1,
				goods_state: true
			});
			store.commit('m_cart/clearCart');
			expect(store.state.m_cart.cart).toHaveLength(0);
		});
	});

	describe('getters', () => {
		beforeEach(() => {
			// 准备测试数据：3 件商品，2 件勾选
			store.commit('m_cart/addToCart', {
				goods_id: 1,
				goods_name: 'A',
				goods_price: 10,
				goods_count: 2,
				goods_state: true
			});
			store.commit('m_cart/addToCart', {
				goods_id: 2,
				goods_name: 'B',
				goods_price: 20,
				goods_count: 3,
				goods_state: false
			});
			store.commit('m_cart/addToCart', {
				goods_id: 3,
				goods_name: 'C',
				goods_price: 5,
				goods_count: 1,
				goods_state: true
			});
		});

		it('total 返回购物车所有商品总数', () => {
			// 注意：addToCart 第二次推入相同 goods_id 会 +1，所以用新 goods_id 模拟
			expect(store.getters['m_cart/total']).toBe(6); // 2 + 3 + 1
		});

		it('checkedCount 返回已勾选商品数量', () => {
			expect(store.getters['m_cart/checkedCount']).toBe(3); // 2 + 1
		});

		it('checkedGoodsAmount 返回已勾选商品总金额（保留两位小数字符串）', () => {
			// 商品A: 2 * 10 = 20，商品C: 1 * 5 = 5，合计 25.00
			expect(store.getters['m_cart/checkedGoodsAmount']).toBe('25.00');
		});

		it('无勾选商品时 checkedGoodsAmount 返回 "0.00"', () => {
			store.commit('m_cart/updateAllGoodsState', false);
			expect(store.getters['m_cart/checkedGoodsAmount']).toBe('0.00');
		});
	});

	describe('persistence 持久化', () => {
		it('操作后自动写入本地存储', () => {
			store.commit('m_cart/addToCart', {
				goods_id: 1,
				goods_name: 'A',
				goods_price: 10,
				goods_count: 1,
				goods_state: true
			});
			const stored = uni.getStorageSync('cart');
			expect(stored).not.toBe('');
			expect(JSON.parse(stored)).toHaveLength(1);
		});

		it('初始化时从本地存储恢复数据', () => {
			uni.setStorageSync(
				'cart',
				JSON.stringify([{ goods_id: 99, goods_name: 'X', goods_price: 1, goods_count: 1, goods_state: true }])
			);
			const newStore = createStore();
			expect(newStore.state.m_cart.cart).toHaveLength(1);
			expect(newStore.state.m_cart.cart[0].goods_id).toBe(99);
		});
	});
});
