/**
 * 用户 Vuex 模块
 * 负责管理用户信息、收货地址、登录状态及订单数据
 * 持久化由 store.js 的 createPersistedState 插件统一处理，无需手写 saveXxxToStorage
 */
export default {
	namespaced: true,

	state: () => ({
		address: {},
		addressList: [],
		token: '',
		userinfo: {},
		orderList: [],
		redirectInfo: null
	}),

	mutations: {
		updateAddress(state, address) {
			state.address = address;
		},

		addAddress(state, address) {
			address.id = Date.now();
			if (address.isDefault) {
				state.addressList.forEach(x => (x.isDefault = false));
			}
			// 全量替换而非 push，确保小程序环境 Vue 响应式可靠性
			state.addressList = [...state.addressList, address];
		},

		editAddress(state, address) {
			const i = state.addressList.findIndex(x => x.id === address.id);
			if (i !== -1) {
				if (address.isDefault) {
					state.addressList.forEach(x => (x.isDefault = false));
				}
				state.addressList.splice(i, 1, address);

				// 编辑的是当前选中地址时同步更新
				if (state.address.id === address.id) {
					state.address = address;
				}
			}
		},

		removeAddress(state, id) {
			state.addressList = state.addressList.filter(x => x.id !== id);

			// 删除的是当前选中地址时重置选中状态
			if (state.address.id === id) {
				state.address = {};
			}
		},

		updateUserInfo(state, userinfo) {
			state.userinfo = userinfo;
		},

		updateToken(state, token) {
			state.token = token;
		},

		addOrder(state, order) {
			state.orderList = [order, ...state.orderList];
		},

		checkAndCleanOrders(state) {
			const now = Date.now();
			const originalLength = state.orderList.length;
			// status === 0 表示待付款，超时未支付则清理
			state.orderList = state.orderList.filter(order => {
				if (order.status === 0 && order.expire_time && now > order.expire_time) {
					return false;
				}
				return true;
			});

			// 触发持久化：即使长度未变，也确保过滤后的最新状态写入存储
			if (state.orderList.length !== originalLength) {
				state.orderList = [...state.orderList];
			}
		},

		updateRedirectInfo(state, info) {
			state.redirectInfo = info;
		},

		updateOrderStatus(state, { order_id, status }) {
			const i = state.orderList.findIndex(x => x.order_id === order_id);
			if (i !== -1) {
				state.orderList[i].status = status;
				// 显式触发响应式更新（直接改对象属性订阅插件不会感知）
				state.orderList = [...state.orderList];
			}
		},

		cancelOrder(state, order_id) {
			state.orderList = state.orderList.filter(x => x.order_id !== order_id);
		}
	},

	getters: {
		addstr(state) {
			if (!state.address.provinceName) return '';
			return state.address.provinceName + state.address.cityName + state.address.countyName + state.address.detailInfo;
		},

		defaultAddress(state) {
			return state.addressList.find(x => x.isDefault) || null;
		},

		orderCounts(state) {
			const counts = {
				pendingPayment: 0,
				toShip: 0,
				toReceive: 0,
				completed: 0,
				afterSales: 0
			};
			state.orderList.forEach(order => {
				if (order.status === 0) counts.pendingPayment++;
				else if (order.status === 1) counts.toShip++;
				else if (order.status === 2) counts.toReceive++;
				else if (order.status === 3) counts.completed++;
				else if (order.status === 4) counts.afterSales++;
			});
			return counts;
		}
	}
};
