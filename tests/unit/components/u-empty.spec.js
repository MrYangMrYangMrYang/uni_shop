/**
 * components/u-empty 组件测试
 * 覆盖：各 mode 文案、buttonText 控制、action 事件
 */
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount, createLocalVue } from '@vue/test-utils';
import UEmpty from '@/components/u-empty/u-empty.vue';

const localVue = createLocalVue();

describe('components/u-empty.vue', () => {
	describe('mode 文案', () => {
		it('默认 mode 显示"暂无数据"', () => {
			const wrapper = mount(UEmpty, { localVue });
			expect(wrapper.find('.u-empty__text').text()).toContain('暂无数据');
		});

		it('mode="search" 显示搜索相关提示', () => {
			const wrapper = mount(UEmpty, { localVue, propsData: { mode: 'search' } });
			expect(wrapper.find('.u-empty__text').text()).toContain('没有找到相关商品');
		});

		it('mode="order" 显示订单相关提示', () => {
			const wrapper = mount(UEmpty, { localVue, propsData: { mode: 'order' } });
			expect(wrapper.find('.u-empty__text').text()).toContain('订单');
		});

		it('mode="address" 显示地址相关提示', () => {
			const wrapper = mount(UEmpty, { localVue, propsData: { mode: 'address' } });
			expect(wrapper.find('.u-empty__text').text()).toContain('地址');
		});

		it('mode="network" 显示网络相关提示', () => {
			const wrapper = mount(UEmpty, { localVue, propsData: { mode: 'network' } });
			expect(wrapper.find('.u-empty__text').text()).toContain('网络');
		});
	});

	describe('自定义文案', () => {
		it('text prop 覆盖默认文案', () => {
			const wrapper = mount(UEmpty, {
				localVue,
				propsData: { text: '自定义提示' }
			});
			expect(wrapper.find('.u-empty__text').text()).toContain('自定义提示');
		});
	});

	describe('按钮控制', () => {
		it('buttonText 非空时显示按钮', () => {
			const wrapper = mount(UEmpty, {
				localVue,
				propsData: { buttonText: '去逛逛' }
			});
			expect(wrapper.find('.u-empty__btn').exists()).toBe(true);
		});

		it('buttonText 为空时不显示按钮', () => {
			const wrapper = mount(UEmpty, {
				localVue,
				propsData: { buttonText: '' }
			});
			expect(wrapper.find('.u-empty__btn').exists()).toBe(false);
		});
	});

	describe('事件', () => {
		it('点击按钮时发射 action 事件', () => {
			const wrapper = mount(UEmpty, {
				localVue,
				propsData: { buttonText: '点击我' }
			});
			wrapper.find('.u-empty__btn').trigger('click');
			expect(wrapper.emitted('action')).toBeTruthy();
		});
	});
});
