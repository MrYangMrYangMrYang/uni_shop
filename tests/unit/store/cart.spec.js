import { describe, it, expect, beforeEach } from 'vitest';
import Vue from 'vue';
import Vuex from 'vuex';
import cartModule from '@/src/store/cart.js';
import { createPersistedState } from '@/src/utils/persist.js';

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
			const goods = { goods_id: 1, goods_name: '商品A', goods_price: 1000, goods_count: 1, goods_state: true };
			store.commit('m_cart/addToCart', goods);
			expect(store.state.m_cart.cart).toHaveLength(1);
			expect(store.state.m_cart.cart[0].goods_id).toBe(1);
		});

		it('addToCart 已存在商品时数量 +1', () => {
			const goods = { goods_id: 1, goods_name: '商品A', goods_price: 1000, goods_count: 1, goods_state: true };
			store.commit('m_cart/addToCart', goods);
			store.commit('m_cart/addToCart', goods);
			expect(store.state.m_cart.cart).toHaveLength(1);
			expect(store.state.m_cart.cart[0].goods_count).toBe(2);
		});

		it('removeGoodsById 正确移除指定商品', () => {
			store.commit('m_cart/addToCart', {
				goods_id: 1,
				goods_name: 'A',
				goods_price: 1000,
				goods_count: 1,
				goods_state: true
			});
			store.commit('m_cart/addToCart', {
				goods_id: 2,
				goods_name: 'B',
				goods_price: 2000,
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
				goods_price: 1000,
				goods_count: 1,
				goods_state: true
			});
			store.commit('m_cart/addToCart', {
				goods_id: 2,
				goods_name: 'B',
				goods_price: 2000,
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
				goods_price: 1000,
				goods_count: 1,
				goods_state: true
			});
			store.commit('m_cart/addToCart', {
				goods_id: 2,
				goods_name: 'B',
				goods_price: 2000,
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
				goods_price: 1000,
				goods_count: 1,
				goods_state: true
			});
			store.commit('m_cart/clearCart');
			expect(store.state.m_cart.cart).toHaveLength(0);
		});
	});

	describe('getters', () => {
		beforeEach(() => {
			// 准备测试数据：3 件商品，2 件勾选（价格单位：分）
			store.commit('m_cart/addToCart', {
				goods_id: 1,
				goods_name: 'A',
				goods_price: 1000, // ¥10.00
				goods_count: 2,
				goods_state: true
			});
			store.commit('m_cart/addToCart', {
				goods_id: 2,
				goods_name: 'B',
				goods_price: 2000, // ¥20.00
				goods_count: 3,
				goods_state: false
			});
			store.commit('m_cart/addToCart', {
				goods_id: 3,
				goods_name: 'C',
				goods_price: 500, // ¥5.00
				goods_count: 1,
				goods_state: true
			});
		});

		it('total 返回购物车所有商品总数', () => {
			expect(store.getters['m_cart/total']).toBe(6); // 2 + 3 + 1
		});

		it('checkedCount 返回已勾选商品数量', () => {
			expect(store.getters['m_cart/checkedCount']).toBe(3); // 2 + 1
		});

		it('checkedGoodsAmount 返回已勾选商品总金额（整数分）', () => {
			// 商品A: 2 * 1000 = 2000分，商品C: 1 * 500 = 500分，合计 2500分 = ¥25.00
			expect(store.getters['m_cart/checkedGoodsAmount']).toBe(2500);
		});

		it('checkedGoodsAmount 为整数而非字符串', () => {
			expect(typeof store.getters['m_cart/checkedGoodsAmount']).toBe('number');
		});

		it('无勾选商品时 checkedGoodsAmount 返回 0', () => {
			store.commit('m_cart/updateAllGoodsState', false);
			expect(store.getters['m_cart/checkedGoodsAmount']).toBe(0);
		});

		it('精确计算：3 * 333分 = 999分 无误', () => {
			// 测试浮点精度：若是浮点 3.33 * 3 可能有误差
			store.commit('m_cart/clearCart');
			store.commit('m_cart/addToCart', {
				goods_id: 99,
				goods_name: 'PrecisionTest',
				goods_price: 333, // ¥3.33
				goods_count: 3,
				goods_state: true
			});
			expect(store.getters['m_cart/checkedGoodsAmount']).toBe(999);
		});
	});

	describe('persistence 持久化', () => {
		it('操作后自动写入本地存储', () => {
			store.commit('m_cart/addToCart', {
				goods_id: 1,
				goods_name: 'A',
				goods_price: 1000,
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
				JSON.stringify([{ goods_id: 99, goods_name: 'X', goods_price: 100, goods_count: 1, goods_state: true }])
			);
			const newStore = createStore();
			expect(newStore.state.m_cart.cart).toHaveLength(1);
			expect(newStore.state.m_cart.cart[0].goods_id).toBe(99);
		});
	});
	describe('updateGoodsState', () => {
		it('切换单个商品勾选状态', () => {
			store.commit('m_cart/addToCart', {
				goods_id: 1,
				goods_name: 'A',
				goods_price: 1000,
				goods_count: 1,
				goods_state: true
			});
			store.commit('m_cart/updateGoodsState', { goods_id: 1, goods_state: false });
			expect(store.state.m_cart.cart[0].goods_state).toBe(false);
		});
		it('不存在的 goods_id 不抛错', () => {
			expect(() => store.commit('m_cart/updateGoodsState', { goods_id: 999, goods_state: true })).not.toThrow();
		});
	});
	describe('updateGoodsCount', () => {
		it('更新商品数量', () => {
			store.commit('m_cart/addToCart', {
				goods_id: 2,
				goods_name: 'B',
				goods_price: 500,
				goods_count: 1,
				goods_state: true
			});
			store.commit('m_cart/updateGoodsCount', { goods_id: 2, goods_count: 5 });
			expect(store.state.m_cart.cart[0].goods_count).toBe(5);
		});
	});
	describe('buyNowGoods', () => {
		it('setBuyNowGoods 存储立即购买商品', () => {
			const goods = { goods_id: 5, goods_name: 'Now', goods_price: 888 };
			store.commit('m_cart/setBuyNowGoods', goods);
			expect(store.state.m_cart.buyNowGoods).toEqual([{ ...goods }]);
		});
		it('setBuyNowGoods(null) 清空', () => {
			store.commit('m_cart/setBuyNowGoods', { goods_id: 5 });
			store.commit('m_cart/setBuyNowGoods', null);
			expect(store.state.m_cart.buyNowGoods).toBeNull();
		});
		it('clearBuyNowGoods 重置为 null', () => {
			store.commit('m_cart/setBuyNowGoods', { goods_id: 5 });
			store.commit('m_cart/clearBuyNowGoods');
			expect(store.state.m_cart.buyNowGoods).toBeNull();
		});
	});
});
