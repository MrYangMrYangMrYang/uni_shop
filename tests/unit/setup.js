/**
 * Vitest 全局 setup
 * mock uni-app 的 uni 全局 API + uni.$showMsg + 本地存储
 * 所有测试文件共享这些 mock
 */

// ============ 本地存储 mock（内存实现） ============
const storageMap = new Map();

const storage = {
	getStorageSync(key) {
		return storageMap.has(key) ? storageMap.get(key) : '';
	},
	setStorageSync(key, value) {
		storageMap.set(key, value);
	},
	removeStorageSync(key) {
		storageMap.delete(key);
	},
	clearStorageSync() {
		storageMap.clear();
	}
};

// ============ 通用 uni API mock ============
const noop = () => {};

const uni = {
	...storage,
	// 界面交互
	showToast: noop,
	showLoading: noop,
	hideLoading: noop,
	showModal: ({ success } = {}) => {
		// 默认模拟用户点击"确认"
		if (typeof success === 'function') success({ confirm: true });
	},
	showActionSheet: noop,
	// 导航
	navigateTo: noop,
	redirectTo: noop,
	switchTab: noop,
	navigateBack: noop,
	reLaunch: noop,
	// 系统
	getSystemInfoSync: () => ({ windowWidth: 375, windowHeight: 667, platform: 'devtools' }),
	// 网络（uni.request 在业务测试中较少直接调用，由 api 层 mock）
	request: noop,
	// TabBar
	setTabBarBadge: noop,
	removeTabBarBadge: noop,
	// 其他常用
	chooseAddress: noop,
	login: noop,
	requestPayment: noop,
	$showMsg: noop
};

// 注入到全局
global.uni = uni;
global.wx = uni; // 部分 API 兼容
global.getCurrentPages = () => [];
global.getApp = () => ({ globalData: {} });
