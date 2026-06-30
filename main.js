// #ifndef VUE3
import Vue from 'vue';
import App from './App';
import { $http } from '@escook/request-miniprogram';
import store from './store/store.js';
import env from './config/env.js';
import { setupRequestInterceptors } from './utils/request.js';

uni.$http = $http;
$http.baseUrl = env.apiBaseUrl;

// 网络层拦截器（401 拦截、超时提示、错误码映射、请求取消、GET 重试）
setupRequestInterceptors($http, store);

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
