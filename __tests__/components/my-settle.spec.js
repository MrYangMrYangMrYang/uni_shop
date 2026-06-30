// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import MySettle from '@/components/my-settle/my-settle.vue';

const localVue = createLocalVue();
localVue.use(Vuex);

// 构造购物车数据：total 个商品，前 checkedCount 个为选中状态
function buildCart(total, checkedCount) {
	const cart = [];
	for (let i = 0; i < total; i++) {
		cart.push({ goods_id: i + 1, goods_state: i < checkedCount });
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
					checkedGoodsAmount: () => '0.00'
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

	describe('methods.settlement 结算前置校验', () => {
		it('未勾选商品时拦截并提示', () => {
			const wrapper = mountWith({ checkedCount: 0, total: 5 });
			const showMsgSpy = vi.fn();
			uni.$showMsg = showMsgSpy;

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

		it('已勾选商品但未登录时触发延时登录流程', () => {
			const wrapper = mountWith({ checkedCount: 2, total: 5, token: '' });
			// 屏蔽 delayNavigate 内部的 setInterval，仅验证分支调用
			const delaySpy = vi.fn();
			wrapper.vm.delayNavigate = delaySpy;

			wrapper.vm.settlement();
			expect(delaySpy).toHaveBeenCalled();
		});
	});
});
