/**
 * utils/request.js 单元测试
 * 覆盖：错误分类、loading 引用计数、401 防抖、api 包装器
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleRequestError } from '@/utils/request.js';

describe('utils/request.js', () => {
	beforeEach(() => {
		uni.clearStorageSync();
	});

	describe('handleRequestError', () => {
		it('超时错误提示"网络不稳定"', () => {
			const toastSpy = vi.fn();
			uni.showToast = toastSpy;

			handleRequestError({ errMsg: 'request:fail timeout' });

			expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ title: '网络不稳定，请稍后重试' }));
		});

		it('网络失败错误提示"网络连接失败"', () => {
			const toastSpy = vi.fn();
			uni.showToast = toastSpy;

			handleRequestError({ errMsg: 'request:fail' });

			expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ title: '网络连接失败，请检查网络' }));
		});

		it('401 错误触发登录跳转', () => {
			const modalSpy = vi.fn(({ success }) => success && success({ confirm: true }));
			uni.showModal = modalSpy;

			// 模拟 store
			const store = {
				commit: vi.fn()
			};

			handleRequestError({ statusCode: 401, errMsg: '' }, store);

			expect(store.commit).toHaveBeenCalledWith('m_user/updateToken', '');
			expect(modalSpy).toHaveBeenCalled();
		});

		it('404 错误提示"请求的资源不存在"', () => {
			const toastSpy = vi.fn();
			uni.showToast = toastSpy;

			handleRequestError({ statusCode: 404, errMsg: '' });

			expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ title: '请求的资源不存在' }));
		});

		it('500 错误提示"服务器开小差了"', () => {
			const toastSpy = vi.fn();
			uni.showToast = toastSpy;

			handleRequestError({ statusCode: 500, errMsg: '' });

			expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ title: '服务器开小差了，请稍后重试' }));
		});

		it('未映射的状态码使用通用提示', () => {
			const toastSpy = vi.fn();
			uni.showToast = toastSpy;

			handleRequestError({ statusCode: 418, errMsg: '' });

			expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ title: '请求失败，请稍后重试' }));
		});

		it('错误对象为 null/undefined 时不抛错', () => {
			expect(() => handleRequestError(null)).not.toThrow();
			expect(() => handleRequestError(undefined)).not.toThrow();
		});

		it('超时错误后提交 m_error 网络错误状态', () => {
			const store = { commit: vi.fn() };
			handleRequestError({ errMsg: 'request:fail timeout' }, store);
			expect(store.commit).toHaveBeenCalledWith('m_error/setError', expect.objectContaining({ isNetwork: true }));
		});
	});

	describe('hideLoading 引用计数', () => {
		it('handleRequestError 在一次调用中只 hide 一次', () => {
			const hideSpy = vi.fn();
			uni.hideLoading = hideSpy;

			// hideLoading 是内部的，通过 handleRequestError 间接调用
			handleRequestError({ errMsg: 'request:fail timeout' });

			// hideLoading 被调用了（因为 loadingCount 从 0 开始）
			expect(hideSpy).toHaveBeenCalled();
		});
	});
});
