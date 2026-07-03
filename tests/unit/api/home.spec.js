/**
 * api/home.js 单元测试
 * 覆盖：swiper / nav / floor 三个首页 API
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGet = vi.fn().mockResolvedValue({ data: { meta: { status: 200 } } });

vi.mock('@/src/utils/request.js', () => ({
	api: {
		get: (...args) => mockGet(...args)
	}
}));

import { getSwiperList, getNavList, getFloorList } from '@/src/api/home.js';

describe('api/home.js', () => {
	beforeEach(() => {
		mockGet.mockClear();
	});

	describe('getSwiperList', () => {
		it('调用 swiperdata 端点', async () => {
			await getSwiperList();
			expect(mockGet).toHaveBeenCalledWith('/api/public/v1/home/swiperdata');
		});
	});

	describe('getNavList', () => {
		it('调用 catitems 端点', async () => {
			await getNavList();
			expect(mockGet).toHaveBeenCalledWith('/api/public/v1/home/catitems');
		});
	});

	describe('getFloorList', () => {
		it('调用 floordata 端点', async () => {
			await getFloorList();
			expect(mockGet).toHaveBeenCalledWith('/api/public/v1/home/floordata');
		});
	});
});
