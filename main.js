// #ifndef VUE3
import Vue from 'vue';
import App from './App';
import { $http } from '@escook/request-miniprogram';
import store from './store/store.js';
import env from './config/env.js';
import { setupRequestInterceptors } from './utils/request.js';
import { formatPrice, migrateStoredPrices } from './utils/price.js';
import { perfStart } from './utils/perf.js';

// 应用初始化计时
perfStart('app_init');

uni.$http = $http;
$http.baseUrl = env.apiBaseUrl;

// 网络层拦截器（401 拦截、超时提示、错误码映射、价格 元↔分 转换、请求计时）
setupRequestInterceptors($http, store);

// 全局价格格式化过滤器：{{ priceInFen | formatPrice }} → ￥XX.XX
Vue.filter('formatPrice', formatPrice);

// 数据迁移：将本地存储中的旧 float-元 价格数据转换为 分
// 使用哨兵 key 确保只执行一次
migrateStoredPrices();

uni.$showMsg = function (title = '数据加载失败！', duration = 1500) {
	uni.showToast({
		title,
		duration,
		icon: 'none'
	});
};

Vue.config.productionTip = false;
App.mpType = 'app';

const app = new Vue({
	...App,
	store
});
app.$mount();
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue';
import App from './App.vue';
export function createApp() {
	const app = createSSRApp(App);
	return {
		app
	};
}
// #endif
