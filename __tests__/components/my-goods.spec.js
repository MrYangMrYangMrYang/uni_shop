/**
 * components/my-goods 组件测试
 * 覆盖：props 控制显隐、事件 emit、价格格式
 */
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount, createLocalVue } from '@vue/test-utils';
import Vue from 'vue';
import MyGoods from '@/components/my-goods/my-goods.vue';

// 注册全局 formatPrice filter（组件依赖）
import { formatPrice } from '@/utils/price.js';
Vue.filter('formatPrice', formatPrice);

const localVue = createLocalVue();

const mockGoods = {
	goods_id: 1,
	goods_name: '测试商品',
	goods_price: 9990, // 99.90元（分）
	goods_count: 2,
	goods_small_logo: '',
	goods_state: true
};

function mountGoods(props = {}) {
	return mount(MyGoods, {
		localVue,
		propsData: {
			goods: mockGoods,
			...props
		}
	});
}

describe('components/my-goods.vue', () => {
	describe('价格渲染', () => {
		it('通过 formatPrice filter 正确显示价格', () => {
			const wrapper = mountGoods();
			const priceEl = wrapper.find('.goods-price');
			expect(priceEl.text()).toBe('￥99.90');
		});

		it('价格为 0 时显示 ￥0.00', () => {
			const wrapper = mountGoods({
				goods: { ...mockGoods, goods_price: 0 }
			});
			const priceEl = wrapper.find('.goods-price');
			expect(priceEl.text()).toBe('￥0.00');
		});
	});

	describe('props 控制显隐', () => {
		it('showRadio=false 时不渲染 radio', () => {
			const wrapper = mountGoods({ showRadio: false });
			expect(wrapper.find('radio').exists()).toBe(false);
		});

		it('showRadio=true 时渲染 radio', () => {
			const wrapper = mountGoods({ showRadio: true });
			expect(wrapper.find('radio').exists()).toBe(true);
		});

		it('showNum=true 时渲染数量步进器', () => {
			const wrapper = mountGoods({ showNum: true });
			expect(wrapper.find('.goods-info-box').exists()).toBe(true);
		});

		it('isGrid 时包含 grid-mode class', () => {
			const wrapper = mountGoods({ isGrid: true });
			expect(wrapper.find('.goods-item').classes()).toContain('grid-mode');
		});

		it('非 isGrid 时不包含 grid-mode class', () => {
			const wrapper = mountGoods({ isGrid: false });
			expect(wrapper.find('.goods-item').classes()).not.toContain('grid-mode');
		});
	});

	describe('事件 emit', () => {
		it('radio 点击时发射 radio-change 事件', () => {
			const wrapper = mountGoods({ showRadio: true });
			const radio = wrapper.find('radio');
			radio.trigger('click');

			expect(wrapper.emitted('radio-change')).toBeTruthy();
			expect(wrapper.emitted('radio-change')[0][0]).toEqual({
				goods_id: 1,
				goods_state: false // !true
			});
		});

		it('点击组件发射 click 事件', () => {
			const wrapper = mountGoods();
			wrapper.find('.goods-item').trigger('click');

			expect(wrapper.emitted('click')).toBeTruthy();
			expect(wrapper.emitted('click')[0][0]).toEqual(mockGoods);
		});
	});
});
