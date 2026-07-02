/**
 * components/my-settle 组件测试
 * 覆盖：全选/部分选中、结算守卫、延时登录、定时器清理、价格（分）
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, createLocalVue } from '@vue/test-utils';
import Vue from 'vue';
import Vuex from 'vuex';
import MySettle from '@/components/my-settle/my-settle.vue';

// 注册全局 formatPrice filter（组件模板依赖）
import { formatPrice } from '@/src/utils/price.js';
Vue.filter('formatPrice', formatPrice);

const localVue = createLocalVue();
localVue.use(Vuex);

// 构造购物车数据：total 个商品，前 checkedCount 个为选中状态（价格单位：分）
function buildCart(total, checkedCount) {
	const cart = [];
	for (let i = 0; i < total; i++) {
		cart.push({ goods_id: i + 1, goods_state: i < checkedCount, goods_price: 1000, goods_count: 1 });
	}
	return cart;
}

// 真实 Vuex store：namespaced 模块，让 mapGetters/mapState/mapMutations 正常解析
function createStore({ checkedCount = 0, total = 0, token = '' } = {}) {
	return new Vuex.Store({
		modules: {
			m_cart: {
				namespaced: true,
				state: { cart: buildCart(total, checkedCount) },
				getters: {
					checkedCount: state => state.cart.filter(g => g.goods_state).length,
					total: state => state.cart.length,
					// 返回整数分（不再返回字符串）
					checkedGoodsAmount: state =>
						state.cart.filter(g => g.goods_state).reduce((sum, g) => sum + g.goods_count * g.goods_price, 0)
				},
				mutations: {
					updateAllGoodsState: () => {}
				}
			},
			m_user: {
				namespaced: true,
				state: { token, address: '', addressList: [], userinfo: {}, orderList: [] },
				getters: { addstr: () => '' },
				mutations: { updateRedirectInfo: () => {} }
			}
		}
	});
}

function mountWith({ checkedCount = 0, total = 0, token = '' } = {}) {
	return mount(MySettle, {
		localVue,
		store: createStore({ checkedCount, total, token })
	});
}

describe('components/my-settle.vue', () => {
	describe('computed.isFullCheck', () => {
		it('已勾选数量 = 总数量时返回 true（全选状态）', () => {
			const wrapper = mountWith({ checkedCount: 5, total: 5 });
			expect(wrapper.vm.isFullCheck).toBe(true);
		});

		it('已勾选数量 < 总数量时返回 false（部分选中）', () => {
			const wrapper = mountWith({ checkedCount: 3, total: 5 });
			expect(wrapper.vm.isFullCheck).toBe(false);
		});

		it('已勾选数量为 0 时返回 false（无选中）', () => {
			const wrapper = mountWith({ checkedCount: 0, total: 5 });
			expect(wrapper.vm.isFullCheck).toBe(false);
		});

		it('购物车为空（total=0, checkedCount=0）时返回 true', () => {
			// 边界场景：0 === 0 → true。业务上"全选"复选框此时应显示选中状态
			const wrapper = mountWith({ checkedCount: 0, total: 0 });
			expect(wrapper.vm.isFullCheck).toBe(true);
		});
	});

	describe('金额显示', () => {
		it('checkedGoodsAmount 返回整数分（非字符串）', () => {
			const wrapper = mountWith({ checkedCount: 2, total: 5 });
			expect(typeof wrapper.vm.checkedGoodsAmount).toBe('number');
		});

		it('无选中商品时 checkedGoodsAmount 为 0', () => {
			const wrapper = mountWith({ checkedCount: 0, total: 5 });
			expect(wrapper.vm.checkedGoodsAmount).toBe(0);
		});
	});

	describe('methods.settlement 结算前置校验', () => {
		it('未勾选商品时拦截并提示', () => {
			const wrapper = mountWith({ checkedCount: 0, total: 5 });
			const showMsgSpy = vi.fn();
			uni.showToast = showMsgSpy;

			wrapper.vm.settlement();
			expect(showMsgSpy).toHaveBeenCalled();
		});

		it('已勾选商品且已登录时触发跳转', () => {
			const wrapper = mountWith({ checkedCount: 2, total: 5, token: 'Bearer xxx' });
			const navSpy = vi.fn();
			uni.navigateTo = navSpy;

			wrapper.vm.settlement();
			expect(navSpy).toHaveBeenCalled();
		});

		it('_settleLock 防止重复提交', () => {
			const wrapper = mountWith({ checkedCount: 2, total: 5, token: 'Bearer xxx' });
			const navSpy = vi.fn();
			uni.navigateTo = navSpy;

			// 第一次点击 — 设置 _settleLock = true
			wrapper.vm.settlement();
			// 第二次点击 — _settleLock 为 true，直接 return
			wrapper.vm.settlement();

			// navigateTo 只调用一次
			expect(navSpy).toHaveBeenCalledTimes(1);
		});

		it('已勾选商品但未登录时触发延时登录流程', () => {
			const wrapper = mountWith({ checkedCount: 2, total: 5, token: '' });
			const delaySpy = vi.fn();
			wrapper.vm.delayNavigate = delaySpy;

			wrapper.vm.settlement();
			expect(delaySpy).toHaveBeenCalled();
		});
	});

	describe('methods.delayNavigate + beforeDestroy', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('delayNavigate 设置倒计时定时器', () => {
			const wrapper = mountWith({ checkedCount: 0, total: 5 });
			const toastSpy = vi.fn();
			uni.showToast = toastSpy;

			wrapper.vm.delayNavigate();

			// 第一秒 toast 已触发
			expect(toastSpy).toHaveBeenCalled();
			expect(wrapper.vm.timer).not.toBeNull();

			// 快进 3 秒后定时器已清理
			vi.advanceTimersByTime(3000);
			expect(wrapper.vm.timer).toBeNull();
		});

		it('beforeDestroy 清理未完成的定时器', () => {
			const wrapper = mountWith({ checkedCount: 0, total: 5 });
			wrapper.vm.delayNavigate();

			expect(wrapper.vm.timer).not.toBeNull();

			// 销毁组件
			wrapper.destroy();

			// 验证 timer 被清理（destroy 会调用 beforeDestroy）
			expect(wrapper.vm.timer).toBeNull();
		});
	});
});
