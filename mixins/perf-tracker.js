/**
 * 页面性能追踪 Mixin
 *
 * 自动为页面记录 onLoad → onReady 的加载耗时。
 * 页面只需混入即可，零代码改动。
 *
 * 用法：
 *   mixins: [perfTracker]
 */

import { perfStart, perfEnd } from '@/utils/perf.js';

export default {
	onLoad() {
		// 使用页面路由作为计时名称
		const pages = getCurrentPages();
		const route = pages.length > 0 ? pages[pages.length - 1].route : 'unknown_page';
		perfStart('page:' + route);
	},

	onReady() {
		const pages = getCurrentPages();
		const route = pages.length > 0 ? pages[pages.length - 1].route : 'unknown_page';
		perfEnd('page:' + route);
	}
};
