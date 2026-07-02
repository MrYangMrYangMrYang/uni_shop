/**
 * Toast 工具模块
 *
 * 取代全局 uni.$showMsg()，提供显式 import 的 toast 函数，
 * 使依赖可追踪、可测试。
 */

const DEFAULTS = {
	duration: 1500,
	icon: 'none'
};

/**
 * 显示中性 / 提示性 toast
 * @param {string} title 提示文案
 * @param {object}  [options]
 * @param {number}  [options.duration=1500] 显示时长 ms
 * @param {string}  [options.icon='none']   图标类型
 */
export function showToast(title = '数据加载失败！', options = {}) {
	uni.showToast({
		title,
		duration: options.duration != null ? options.duration : DEFAULTS.duration,
		icon: options.icon || DEFAULTS.icon
	});
}

/**
 * 显示错误 toast（语义别名，行为同 showToast）
 * @param {string} title
 * @param {object} [options]
 */
export function showError(title = '操作失败', options = {}) {
	showToast(title, options);
}
