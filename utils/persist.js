/**
 * Vuex 持久化插件
 * 自动将指定 state 字段同步到本地存储，消除每个模块重复的 saveXxxToStorage 样板代码
 *
 * 用法：
 *   // store/store.js
 *   import { createPersistedState } from '@/utils/persist.js'
 *   const store = new Vuex.Store({
 *     plugins: [createPersistedState({
 *       paths: {
 *         'm_cart.cart': 'cart',          // key: state路径, value: storage key
 *         'm_user.address': 'address',
 *         'm_user.addressList': 'addressList',
 *         'm_user.token': 'token',
 *         'm_user.userinfo': 'userinfo',
 *         'm_user.orderList': 'orderList'
 *       }
 *     })]
 *   })
 *
 * 原理：
 * - 初始化：从 storage 读取数据覆盖 state
 * - 监听：subscribe mutation，命中 paths 时写入 storage
 */

/**
 * 按路径取值，支持 'm_cart.cart' 这样的嵌套路径
 */
function getValueByPath(obj, path) {
	return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

/**
 * 按路径赋值
 */
function setValueByPath(obj, path, value) {
	const keys = path.split('.');
	const lastKey = keys.pop();
	const target = keys.reduce((acc, key) => {
		if (!acc[key]) acc[key] = {};
		return acc[key];
	}, obj);
	target[lastKey] = value;
}

/**
 * 创建持久化插件
 * @param {object} options 配置项
 * @param {object} options.paths { state路径: storage key } 映射
 * @param {string} options.storageKeyPrefix 可选的 storage key 前缀
 */
export function createPersistedState(options = {}) {
	const { paths = {}, storageKeyPrefix = '' } = options;

	// 反向映射：模块命名空间 → 需要持久化的字段
	// 例如 { 'm_cart.cart': 'cart' } → { 'm_cart': [{ path: 'm_cart.cart', key: 'cart' }] }
	const moduleMap = {};
	Object.keys(paths).forEach(statePath => {
		const namespace = statePath.split('.')[0];
		if (!moduleMap[namespace]) moduleMap[namespace] = [];
		moduleMap[namespace].push({ statePath, storageKey: storageKeyPrefix + paths[statePath] });
	});

	return store => {
		// ============ 初始化：从 storage 恢复数据 ============
		Object.values(moduleMap)
			.flat()
			.forEach(({ statePath, storageKey }) => {
				const stored = uni.getStorageSync(storageKey);
				if (stored !== '' && stored !== undefined && stored !== null) {
					try {
						const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
						setValueByPath(store.state, statePath, parsed);
					} catch (e) {
						console.warn(`[persist] 恢复 ${storageKey} 失败:`, e);
					}
				}
			});

		// ============ 订阅 mutation：命中 paths 时写入 storage ============
		store.subscribe((mutation, state) => {
			const namespace = mutation.type.split('/')[0];
			const fields = moduleMap[namespace];
			if (!fields) return;

			fields.forEach(({ statePath, storageKey }) => {
				const value = getValueByPath(state, statePath);
				// token 是字符串，其他都是对象/数组，统一处理
				const serialized = typeof value === 'string' ? value : JSON.stringify(value || []);
				uni.setStorageSync(storageKey, serialized);
			});
		});
	};
}
