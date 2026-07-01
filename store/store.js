/**
 * Vuex 状态管理中心
 * 整合所有业务模块，统一管理全局数据状态
 */
import Vue from 'vue';
import Vuex from 'vuex';
import moduleCart from '@/store/cart.js';
import moduleUser from '@/store/user.js';
import moduleError from '@/store/error.js';
import { createPersistedState } from '@/utils/persist.js';

Vue.use(Vuex);

const store = new Vuex.Store({
	modules: {
		m_cart: moduleCart,
		m_user: moduleUser,
		m_error: moduleError
	},
	plugins: [
		// 持久化配置：state 路径 → 本地存储 key
		// 命中以下字段的 mutation 会自动同步到 storage，无需在每个模块写 saveXxxToStorage
		createPersistedState({
			paths: {
				'm_cart.cart': 'cart',
				'm_user.address': 'address',
				'm_user.addressList': 'addressList',
				'm_user.token': 'token',
				'm_user.userinfo': 'userinfo',
				'm_user.orderList': 'orderList'
			}
		})
	]
});

export default store;
