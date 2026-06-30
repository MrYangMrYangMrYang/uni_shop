import { describe, it, expect, beforeEach } from 'vitest';
import Vue from 'vue';
import Vuex from 'vuex';
import userModule from '@/store/user.js';
import { createPersistedState } from '@/utils/persist.js';

Vue.use(Vuex);

function createStore() {
	return new Vuex.Store({
		modules: { m_user: { ...userModule, namespaced: true } },
		plugins: [
			createPersistedState({
				paths: {
					'm_user.address': 'address',
					'm_user.addressList': 'addressList',
					'm_user.token': 'token',
					'm_user.userinfo': 'userinfo',
					'm_user.orderList': 'orderList'
				}
			})
		]
	});
}

describe('store/user.js', () => {
	let store;

	beforeEach(() => {
		uni.clearStorageSync();
		store = createStore();
	});

	describe('mutations - 地址管理', () => {
		it('addAddress 新增地址时自动分配 id', () => {
			const addr = { userName: '张三', telNumber: '13800138000', isDefault: false };
			store.commit('m_user/addAddress', addr);
			expect(store.state.m_user.addressList).toHaveLength(1);
			expect(store.state.m_user.addressList[0].id).toBeDefined();
		});

		it('addAddress 设为默认时取消其他地址的默认状态（排他逻辑）', () => {
			store.commit('m_user/addAddress', { userName: '张三', telNumber: '13800138000', isDefault: true });
			store.commit('m_user/addAddress', { userName: '李四', telNumber: '13900139000', isDefault: true });

			const list = store.state.m_user.addressList;
			expect(list).toHaveLength(2);
			const defaultCount = list.filter(x => x.isDefault).length;
			expect(defaultCount).toBe(1);
			expect(list[1].isDefault).toBe(true);
			expect(list[0].isDefault).toBe(false);
		});

		it('editAddress 编辑当前选中地址时同步更新 state.address', () => {
			const addr = { userName: '张三', telNumber: '13800138000', isDefault: true };
			store.commit('m_user/addAddress', addr);
			const added = store.state.m_user.addressList[0];
			store.commit('m_user/updateAddress', added);

			// 修改姓名后编辑
			const updated = { ...added, userName: '张三丰' };
			store.commit('m_user/editAddress', updated);

			expect(store.state.m_user.address.userName).toBe('张三丰');
		});

		it('removeAddress 删除当前选中地址时重置为空对象', () => {
			const addr = { userName: '张三', telNumber: '13800138000', isDefault: true };
			store.commit('m_user/addAddress', addr);
			const added = store.state.m_user.addressList[0];
			store.commit('m_user/updateAddress', added);

			store.commit('m_user/removeAddress', added.id);
			expect(store.state.m_user.address).toEqual({});
			expect(store.state.m_user.addressList).toHaveLength(0);
		});
	});

	describe('mutations - 订单清理 checkAndCleanOrders', () => {
		it('清理已过期的待付款订单（status=0 且 expire_time < now）', () => {
			const now = Date.now();
			store.state.m_user.orderList = [
				{ order_id: 'A', status: 0, expire_time: now - 1000 }, // 已过期
				{ order_id: 'B', status: 0, expire_time: now + 60000 }, // 未过期
				{ order_id: 'C', status: 1, expire_time: now - 1000 } // 已支付，不应清理
			];
			store.commit('m_user/checkAndCleanOrders');

			expect(store.state.m_user.orderList).toHaveLength(2);
			const ids = store.state.m_user.orderList.map(x => x.order_id);
			expect(ids).toContain('B');
			expect(ids).toContain('C');
			expect(ids).not.toContain('A');
		});

		it('无过期订单时不触发存储写入', () => {
			const now = Date.now();
			store.state.m_user.orderList = [{ order_id: 'A', status: 1, expire_time: now - 1000 }];
			// 不应抛错
			store.commit('m_user/checkAndCleanOrders');
			expect(store.state.m_user.orderList).toHaveLength(1);
		});

		it('待付款订单无 expire_time 字段时不清理', () => {
			store.state.m_user.orderList = [
				{ order_id: 'A', status: 0 } // 无 expire_time
			];
			store.commit('m_user/checkAndCleanOrders');
			expect(store.state.m_user.orderList).toHaveLength(1);
		});
	});

	describe('mutations - 订单状态更新', () => {
		it('updateOrderStatus 正确更新指定订单状态', () => {
			store.state.m_user.orderList = [
				{ order_id: 'A', status: 0 },
				{ order_id: 'B', status: 0 }
			];
			store.commit('m_user/updateOrderStatus', { order_id: 'A', status: 1 });

			const order = store.state.m_user.orderList.find(x => x.order_id === 'A');
			expect(order.status).toBe(1);
		});

		it('updateOrderStatus 订单不存在时安全跳过', () => {
			store.state.m_user.orderList = [{ order_id: 'A', status: 0 }];
			// 不应抛错
			store.commit('m_user/updateOrderStatus', { order_id: 'NOT_EXIST', status: 1 });
			expect(store.state.m_user.orderList).toHaveLength(1);
		});

		it('cancelOrder 从列表中移除指定订单', () => {
			store.state.m_user.orderList = [
				{ order_id: 'A', status: 0 },
				{ order_id: 'B', status: 0 }
			];
			store.commit('m_user/cancelOrder', 'A');
			expect(store.state.m_user.orderList).toHaveLength(1);
			expect(store.state.m_user.orderList[0].order_id).toBe('B');
		});
	});

	describe('getters', () => {
		it('addstr 拼接完整地址字符串', () => {
			store.commit('m_user/updateAddress', {
				provinceName: '广东省',
				cityName: '深圳市',
				countyName: '南山区',
				detailInfo: '科技园'
			});
			expect(store.getters['m_user/addstr']).toBe('广东省深圳市南山区科技园');
		});

		it('addstr 未选择地址时返回空字符串', () => {
			expect(store.getters['m_user/addstr']).toBe('');
		});

		it('defaultAddress 返回标记为默认的地址', () => {
			store.commit('m_user/addAddress', { userName: 'A', isDefault: false });
			store.commit('m_user/addAddress', { userName: 'B', isDefault: true });
			const def = store.getters['m_user/defaultAddress'];
			expect(def).not.toBeNull();
			expect(def.userName).toBe('B');
		});

		it('orderCounts 按状态正确统计订单数量', () => {
			store.state.m_user.orderList = [
				{ status: 0 },
				{ status: 0 }, // 2 个待付款
				{ status: 1 }, // 1 个待发货
				{ status: 2 }, // 1 个待收货
				{ status: 3 },
				{ status: 3 }, // 2 个已完成
				{ status: 4 } // 1 个售后
			];
			const counts = store.getters['m_user/orderCounts'];
			expect(counts).toEqual({
				pendingPayment: 2,
				toShip: 1,
				toReceive: 1,
				completed: 2,
				afterSales: 1
			});
		});
	});
});
