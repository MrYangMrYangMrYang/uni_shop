/**
 * E2E 测试：完整购物流程 + 登录守卫
 *
 * 场景一（浏览 → 加购）：
 *   首页浏览 → 搜索商品 → 查看详情 → 加入购物车
 *
 * 场景二（登录守卫与结算）：
 *   购物车未登录引导 → 登录页跳转 → 登录后结算
 *
 * 运行：
 *   npm run test:e2e
 *
 * 前置条件：
 *   1. 微信开发者工具已安装并打开本项目
 *   2. 开发者工具 "设置 → 安全设置 → 服务端口" 已开启（默认端口 9420）
 *   3. npm run dev:mp-weixin 或 HBuilderX 已编译运行
 *
 * 注意：E2E 测试依赖 GUI 工具和真实后端数据，无法在无头 CI 环境运行。
 *       本地开发时手动执行以验证关键业务流程。
 */

const { launch } = require('./setup');

describe('🛒 场景一：浏览 → 加购', () => {
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
		const tags = await page.$$('.hot-search__tag');
		expect(tags.length).toBeGreaterThan(0);
		await tags[0].tap();
		await mp.waitFor(1000);
		const listPage = await mp.currentPage();
		expect(listPage.path).toBe('subpkg/goods-list/goods-list');
	});

	test('4. 从商品列表进入详情页', async () => {
		const page = await mp.currentPage();
		const items = await page.$$('.goods-list-item');
		expect(items.length).toBeGreaterThan(0);
		await items[0].tap();
		await mp.waitFor(1000);
		const detailPage = await mp.currentPage();
		expect(detailPage.path).toBe('subpkg/goods-detail/goods-detail');
	});

	test('5. 商品详情页展示价格和名称', async () => {
		const page = await mp.currentPage();
		const price = await page.$('.price');
		const name = await page.$('.goods-name');
		expect(price).not.toBeNull();
		expect(name).not.toBeNull();
	});

	test('6. 加入购物车', async () => {
		const page = await mp.currentPage();
		const buttons = await page.$$('.uni-goods-nav-button');
		expect(buttons.length).toBeGreaterThan(0);
		await buttons[0].tap();
		await mp.waitFor(1500);
	});
});

describe('🔐 场景二：登录守卫与结算', () => {
	let mp;

	beforeAll(async () => {
		mp = await launch();
	}, 30000);

	afterAll(async () => {
		if (mp) await mp.close();
	});

	test('7. 购物车页未登录时展示登录引导', async () => {
		await mp.reLaunch('/pages/cart/cart');
		await mp.waitFor(1000);
		const page = await mp.currentPage();
		expect(page.path).toBe('pages/cart/cart');

		// 未登录时应展示"去登录"引导按钮
		const loginBtn = await page.$('.go-login-btn');
		expect(loginBtn).not.toBeNull();
	});

	test('8. 点击"去登录"跳转至我的页面', async () => {
		const page = await mp.currentPage();
		const loginBtn = await page.$('.go-login-btn');
		await loginBtn.tap();
		await mp.waitFor(1000);

		const myPage = await mp.currentPage();
		expect(myPage.path).toBe('pages/my/my');
	});

	test('9. 我的页面展示登录组件', async () => {
		const page = await mp.currentPage();
		// my-login 组件的登录按钮（open-type="getUserInfo"）
		const loginBtn = await page.$('.btn-login');
		expect(loginBtn).not.toBeNull();
	});

	test('10. 点击一键登录 → 回到购物车展示内容', async () => {
		const page = await mp.currentPage();
		const loginBtn = await page.$('.btn-login');

		// 触发登录按钮（在开发者工具中 getUserInfo 会返回模拟数据）
		await loginBtn.tap();
		await mp.waitFor(2000); // 等待 uni.login + token 写入 + 页面回跳

		// 登录成功后应自动回跳到购物车（redirectInfo 中记录的 from）
		// 购物车页此时有 token，展示 cart-content 而非登录引导
		const currentPage = await mp.currentPage();
		// 可能停留在购物车（已登录状态）或我的页面（如果回跳失败）
		const isCartPage = currentPage.path === 'pages/cart/cart';
		const isMyPage = currentPage.path === 'pages/my/my';

		if (isCartPage) {
			// 登录回跳成功：购物车应该展示内容区域
			const loginTip = await currentPage.$('.go-login-btn');
			expect(loginTip).toBeNull();
		} else {
			// 如果停留在我的页面，手动回到购物车
			expect(isMyPage).toBe(true);
			await mp.switchTab('/pages/cart/cart');
			await mp.waitFor(800);
			const cartPage = await mp.currentPage();
			// 登录后引导按钮应消失
			const loginTip = await cartPage.$('.go-login-btn');
			expect(loginTip).toBeNull();
		}
	});

	test('11. 结算按钮可见并跳转订单确认页', async () => {
		// 确保在购物车页
		await mp.switchTab('/pages/cart/cart');
		await mp.waitFor(800);
		const page = await mp.currentPage();
		expect(page.path).toBe('pages/cart/cart');

		// 结算按钮（.btn-settle）位于 my-settle 组件内
		const settleBtn = await page.$('.btn-settle');
		expect(settleBtn).not.toBeNull();

		const text = await settleBtn.text();
		expect(text).toMatch(/结算/);

		await settleBtn.tap();
		await mp.waitFor(1500);

		// 点击结算 → 跳转订单确认页
		const orderPage = await mp.currentPage();
		expect(orderPage.path).toBe('subpkg/order/order');
	});
});
