/**
 * api/goods.js 单元测试
 * 覆盖：所有导出 API 函数的参数传递
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// 模拟 api 对象，验证各 API 函数调用 api.get 的参数
const mockGet = vi.fn().mockResolvedValue({ data: { meta: { status: 200 } } });

vi.mock('@/src/utils/request.js', () => ({
	api: {
		get: (...args) => mockGet(...args)
	}
}));

import { searchGoods, getGoodsDetail, getSearchSuggest, getCategories } from '@/src/api/goods.js';

describe('api/goods.js', () => {
	beforeEach(() => {
		mockGet.mockClear();
	});

	describe('searchGoods', () => {
		it('传递搜索参数到正确的端点', async () => {
			await searchGoods({ query: '手机', cid: 1, pagenum: 1, pagesize: 20 });
			expect(mockGet).toHaveBeenCalledWith('/api/public/v1/goods/search', {
				query: '手机',
				cid: 1,
				pagenum: 1,
				pagesize: 20
			});
		});

		it('空参数也可正常调用', async () => {
			await searchGoods({});
			expect(mockGet).toHaveBeenCalledWith('/api/public/v1/goods/search', {});
		});
	});

	describe('getGoodsDetail', () => {
		it('传递 goods_id 到详情端点', async () => {
			await getGoodsDetail('12345');
			expect(mockGet).toHaveBeenCalledWith('/api/public/v1/goods/detail', {
				goods_id: '12345'
			});
		});
	});

	describe('getSearchSuggest', () => {
		it('传递 query 到搜索建议端点', async () => {
			await getSearchSuggest('iPhone');
			expect(mockGet).toHaveBeenCalledWith('/api/public/v1/goods/qsearch', {
				query: 'iPhone'
			});
		});
	});

	describe('getCategories', () => {
		it('无参数调用分类端点', async () => {
			await getCategories();
			expect(mockGet).toHaveBeenCalledWith('/api/public/v1/categories');
		});
	});
});
