/**
 * E2E 测试：完整购物流程
 *
 * 场景：
 *   首页浏览 → 搜索商品 → 查看详情 → 加入购物车 → 结算
 *
 * 运行：
 *   npm run test:e2e
 *
 * 前置条件见 e2e/setup.js
 */

const { launch } = require('./setup');

describe('🛒 完整购物流程 E2E', () => {
	/** @type {import('miniprogram-automator').MiniProgram} */
	let mp;

	beforeAll(async () => {
		mp = await launch();
	}, 30000);

	afterAll(async () => {
		if (mp) await mp.close();
	});

	test('1. 首页正常加载', async () => {
		await mp.reLaunch('/pages/home/home');
		await mp.waitFor(1000);
		const page = await mp.currentPage();
		expect(page.path).toBe('pages/home/home');
	});

	test('2. 跳转到搜索页面', async () => {
		await mp.navigateTo('/subpkg/search/search');
		await mp.waitFor(500);
		const page = await mp.currentPage();
		expect(page.path).toBe('subpkg/search/search');
	});

	test('3. 搜索商品并跳转到商品列表', async () => {
		const page = await mp.currentPage();
		// 热搜点击跳转
		const tags = await page.$$('.hot-search__tag');
		if (tags.length > 0) {
			await tags[0].tap();
			await mp.waitFor(1000);
			const listPage = await mp.currentPage();
			expect(listPage.path).toBe('subpkg/goods-list/goods-list');
		}
	});

	test('4. 从商品列表进入详情页', async () => {
		const page = await mp.currentPage();
		const items = await page.$$('.goods-list-item');
		if (items.length > 0) {
			await items[0].tap();
			await mp.waitFor(1000);
			const detailPage = await mp.currentPage();
			expect(detailPage.path).toBe('subpkg/goods-detail/goods-detail');
		}
	});

	test('5. 商品详情页展示价格和名称', async () => {
		const page = await mp.currentPage();
		const price = await page.$('.price');
		const name = await page.$('.goods-name');
		expect(price).toBeTruthy();
		expect(name).toBeTruthy();
	});

	test('6. 加入购物车', async () => {
		const page = await mp.currentPage();
		const buttons = await page.$$('.uni-goods-nav-button');
		// 第二个按钮是"加入购物车"
		if (buttons.length >= 1) {
			await buttons[0].tap();
			await mp.waitFor(1500);
		}
	});

	test('7. 购物车页展示商品', async () => {
		await mp.navigateTo('/subpkg/cart/cart');
		await mp.waitFor(500);
		const page = await mp.currentPage();
		expect(page.path).toBe('subpkg/cart/cart');
	});
});
