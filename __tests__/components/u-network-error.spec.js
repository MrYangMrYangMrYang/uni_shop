/**
 * components/u-network-error 组件测试
 * 覆盖：默认/custom props、retry 事件
 */
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount, createLocalVue } from '@vue/test-utils';
import UNetworkError from '@/components/u-network-error/u-network-error.vue';

const localVue = createLocalVue();

describe('components/u-network-error.vue', () => {
	describe('文案渲染', () => {
		it('默认 text 为"网络连接失败"', () => {
			const wrapper = mount(UNetworkError, { localVue });
			expect(wrapper.text()).toContain('网络连接失败');
		});

		it('自定义 text 覆盖默认', () => {
			const wrapper = mount(UNetworkError, {
				localVue,
				propsData: { text: '自定义错误' }
			});
			expect(wrapper.text()).toContain('自定义错误');
		});

		it('自定义 subText', () => {
			const wrapper = mount(UNetworkError, {
				localVue,
				propsData: { subText: '请稍后再试' }
			});
			expect(wrapper.text()).toContain('请稍后再试');
		});
	});

	describe('重试按钮', () => {
		it('点击重试按钮发射 retry 事件', () => {
			const wrapper = mount(UNetworkError, { localVue });
			wrapper.find('.u-network-error__btn').trigger('click');
			expect(wrapper.emitted('retry')).toBeTruthy();
		});

		it('重试按钮存在', () => {
			const wrapper = mount(UNetworkError, { localVue });
			expect(wrapper.find('.u-network-error__btn').exists()).toBe(true);
		});
	});
});
