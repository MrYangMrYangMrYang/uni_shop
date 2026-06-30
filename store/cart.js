/**
 * 购物车 Vuex 模块
 * 负责管理购物车数据的增删改查
 * 持久化由 store.js 的 createPersistedState 插件统一处理，无需手写 saveXxxToStorage
 */
export default {
	namespaced: true,

	state: () => ({
		// 购物车商品列表
		cart: [],
		// "立即购买" 临时商品（从详情页直跳订单页时使用，下单后清空）
		buyNowGoods: null
	}),

	mutations: {
		addToCart(state, goods) {
			const findResult = state.cart.find(x => x.goods_id === goods.goods_id);

			if (!findResult) {
				state.cart = [...state.cart, { ...goods }];
			} else {
				findResult.goods_count++;
			}
		},

		updateGoodsState(state, goods) {
			const findResult = state.cart.find(x => x.goods_id === goods.goods_id);
			if (findResult) {
				findResult.goods_state = goods.goods_state;
			}
		},

		updateGoodsCount(state, goods) {
			const findResult = state.cart.find(x => x.goods_id === goods.goods_id);
			if (findResult) {
				findResult.goods_count = goods.goods_count;
			}
		},

		removeGoodsById(state, goods_id) {
			state.cart = state.cart.filter(x => x.goods_id !== goods_id);
		},

		updateAllGoodsState(state, newState) {
			state.cart.forEach(x => (x.goods_state = newState));
		},

		clearCart(state) {
			state.cart = [];
		},

		removeCheckedGoods(state) {
			state.cart = state.cart.filter(x => !x.goods_state);
		},

		// "立即购买" 临时商品
		setBuyNowGoods(state, goods) {
			state.buyNowGoods = goods ? [{ ...goods }] : null;
		},

		clearBuyNowGoods(state) {
			state.buyNowGoods = null;
		}
	},

	getters: {
		total(state) {
			return state.cart.reduce((total, item) => (total += item.goods_count), 0);
		},

		checkedCount(state) {
			return state.cart.filter(x => x.goods_state).reduce((total, item) => (total += item.goods_count), 0);
		},

		checkedGoodsAmount(state) {
			return state.cart
				.filter(x => x.goods_state)
				.reduce((total, item) => (total += item.goods_count * item.goods_price), 0)
				.toFixed(2);
		}
	}
};
