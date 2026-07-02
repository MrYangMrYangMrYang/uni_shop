/**
 * utils/price.js 单元测试
 * 覆盖：元↔分转换、格式化、乘法、迁移
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
	FEN_RATIO,
	PRICE_KEYS,
	yuanToFen,
	fenToYuan,
	formatPrice,
	multiplyPrice,
	migrateStoredPrices
} from '@/src/utils/price.js';

describe('utils/price.js', () => {
	describe('常量', () => {
		it('FEN_RATIO 为 100', () => {
			expect(FEN_RATIO).toBe(100);
		});

		it('PRICE_KEYS 包含已知价格字段', () => {
			expect(PRICE_KEYS).toContain('goods_price');
			expect(PRICE_KEYS).toContain('order_price');
			expect(PRICE_KEYS).toContain('total_price');
		});
	});

	describe('yuanToFen', () => {
		it('整数元转换为分', () => {
			expect(yuanToFen(10)).toBe(1000);
			expect(yuanToFen(100)).toBe(10000);
		});

		it('小数元转换为分', () => {
			expect(yuanToFen(9.99)).toBe(999);
			expect(yuanToFen(0.01)).toBe(1);
			expect(yuanToFen(0.5)).toBe(50);
		});

		it('字符串数字也可正常转换', () => {
			expect(yuanToFen('10')).toBe(1000);
			expect(yuanToFen('0.01')).toBe(1);
		});

		it('浮点精度边界：0.1 + 0.2 类问题', () => {
			// 0.1 元 = 10 分（Math.round 确保不会是 10.0000000002）
			expect(yuanToFen(0.1)).toBe(10);
			expect(yuanToFen(0.29)).toBe(29);
		});

		it('0 元转换为 0 分', () => {
			expect(yuanToFen(0)).toBe(0);
		});

		it('大额数值转换', () => {
			expect(yuanToFen(99999.99)).toBe(9999999);
		});
	});

	describe('fenToYuan', () => {
		it('整数分转换为元', () => {
			expect(fenToYuan(1000)).toBe(10);
			expect(fenToYuan(10000)).toBe(100);
		});

		it('小分值转换', () => {
			expect(fenToYuan(1)).toBe(0.01);
			expect(fenToYuan(50)).toBe(0.5);
		});

		it('0 分 -> 0 元', () => {
			expect(fenToYuan(0)).toBe(0);
		});

		it('与 yuanToFen 互逆', () => {
			const original = 1234.56;
			expect(fenToYuan(yuanToFen(original))).toBeCloseTo(original, 2);
		});
	});

	describe('formatPrice', () => {
		it('正常分转显示字符串', () => {
			expect(formatPrice(1000)).toBe('￥10.00');
			expect(formatPrice(999)).toBe('￥9.99');
			expect(formatPrice(1)).toBe('￥0.01');
		});

		it('0 分显示为 ￥0.00', () => {
			expect(formatPrice(0)).toBe('￥0.00');
		});

		it('大额显示', () => {
			expect(formatPrice(9999999)).toBe('￥99999.99');
		});

		it('NaN 输入降级为 ￥0.00', () => {
			expect(formatPrice(NaN)).toBe('￥0.00');
			expect(formatPrice('abc')).toBe('￥0.00');
		});

		it('字符串数字可正常格式化', () => {
			expect(formatPrice('1000')).toBe('￥10.00');
		});
	});

	describe('multiplyPrice', () => {
		it('整数乘法：数量 × 单价(分) = 总价(分)', () => {
			expect(multiplyPrice(3, 1000)).toBe(3000); // 3件 × ¥10 = 3000分
			expect(multiplyPrice(1, 999)).toBe(999);
		});

		it('Math.round 确保整数安全性', () => {
			expect(multiplyPrice(3.7, 1000)).toBe(4000); // count rounded to 4
			expect(multiplyPrice(3, 1000.2)).toBe(3000); // price rounded to 1000
		});

		it('0 数量返回 0', () => {
			expect(multiplyPrice(0, 1000)).toBe(0);
		});
	});

	describe('migrateStoredPrices', () => {
		beforeEach(() => {
			uni.clearStorageSync();
		});

		it('首次执行时迁移旧数据并标记完成', () => {
			// 写入旧格式数据（元）
			const oldCart = [{ goods_id: 1, goods_price: 10.5, goods_count: 1, goods_state: true }];
			uni.setStorageSync('cart', JSON.stringify(oldCart));

			const result = migrateStoredPrices();
			expect(result).toBe(true);

			// 验证数据已转换
			const stored = JSON.parse(uni.getStorageSync('cart'));
			expect(stored[0].goods_price).toBe(1050);
		});

		it('哨兵 key 存在时跳过迁移', () => {
			uni.setStorageSync('__price_migration_v1__', '1');
			const result = migrateStoredPrices();
			expect(result).toBe(false);
		});

		it('空存储不报错', () => {
			const result = migrateStoredPrices();
			expect(result).toBe(false); // 无数据可迁移
		});

		it('orderList 也参与迁移', () => {
			const oldOrderList = [
				{
					order_id: 'X',
					total_price: 99.99,
					goods: [{ goods_price: 49.99 }]
				}
			];
			uni.setStorageSync('orderList', JSON.stringify(oldOrderList));

			migrateStoredPrices();

			const stored = JSON.parse(uni.getStorageSync('orderList'));
			expect(stored[0].total_price).toBe(9999);
		});

		it('损坏 JSON 时不抛错', () => {
			uni.setStorageSync('cart', '{not valid json');
			expect(() => migrateStoredPrices()).not.toThrow();
		});
	});
});
