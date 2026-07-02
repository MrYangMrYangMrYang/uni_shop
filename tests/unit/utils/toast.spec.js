/**
 * utils/toast.js 单元测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { showToast, showError } from '@/src/utils/toast.js';

describe('utils/toast.js', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// uni.showToast is mocked as noop in setup.js, replace with spy
		uni.showToast = vi.fn();
	});

	describe('showToast', () => {
		it('使用默认参数调用 uni.showToast', () => {
			showToast();
			expect(uni.showToast).toHaveBeenCalledWith({
				title: '数据加载失败！',
				duration: 1500,
				icon: 'none'
			});
		});

		it('自定义标题', () => {
			showToast('操作成功');
			expect(uni.showToast).toHaveBeenCalledWith({
				title: '操作成功',
				duration: 1500,
				icon: 'none'
			});
		});

		it('自定义 duration', () => {
			showToast('提示', { duration: 3000 });
			expect(uni.showToast).toHaveBeenCalledWith({
				title: '提示',
				duration: 3000,
				icon: 'none'
			});
		});

		it('自定义 icon', () => {
			showToast('成功', { icon: 'success' });
			expect(uni.showToast).toHaveBeenCalledWith({
				title: '成功',
				duration: 1500,
				icon: 'success'
			});
		});

		it('空字符串标题', () => {
			showToast('');
			expect(uni.showToast).toHaveBeenCalledWith({
				title: '',
				duration: 1500,
				icon: 'none'
			});
		});

		it('duration 为 0 时使用显式传入的值', () => {
			showToast('快', { duration: 0 });
			expect(uni.showToast).toHaveBeenCalledWith({
				title: '快',
				duration: 0,
				icon: 'none'
			});
		});
	});

	describe('showError', () => {
		it('使用默认错误文案', () => {
			showError();
			expect(uni.showToast).toHaveBeenCalledWith({
				title: '操作失败',
				duration: 1500,
				icon: 'none'
			});
		});

		it('自定义错误文案', () => {
			showError('网络异常');
			expect(uni.showToast).toHaveBeenCalledWith({
				title: '网络异常',
				duration: 1500,
				icon: 'none'
			});
		});
	});
});
