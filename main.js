
// uni-app中的条件编译：#ifndef VUE3：如果不是Vue3环境，#ifdef VUE3：如果是Vue3环境，#endif：结束条件编译
// #ifndef VUE3
import Vue from 'vue'
import App from './App'
// 导入网络请求的实例对象
import { $http } from '@escook/request-miniprogram'
// 导入 store 的实例对象，用于状态管理
import store from './store/store.js'

/**
 * 全局网络请求配置
 */
// 将网络请求对象挂载到 uni 顶级对象上，方便在全局调用
uni.$http = $http

// 配置请求的根路径（API 接口基础地址）
$http.baseUrl = 'https://api-hmugo-web.itheima.net'

/**
 * 请求拦截器
 * 在请求发起之前进行预处理
 */
$http.beforeRequest = function (options) {
	// 展示加载提示框，提升用户体验
	uni.showLoading({
		title: '数据加载中...',
	})

	// 权限控制：判断请求的是否为有权限的 API 接口（路径中包含 /my/ 的接口）
	if (options.url.indexOf('/my/') !== -1) {
		// 为请求头添加身份认证字段 Authorization
		options.header = {
			// 从 Vuex 的 m_user 模块中动态获取最新的 token
			Authorization: store.state.m_user.token,
		}
	}
}

/**
 * 响应拦截器
 * 在请求完成（无论成功或失败）之后进行处理
 */
$http.afterRequest = function () {
	// 隐藏加载提示框
	uni.hideLoading()
}

/**
 * 全局消息提示方法封装
 * @param {String} title 提示的内容
 * @param {Number} duration 提示持续时间（毫秒）
 */
uni.$showMsg = function (title = '数据加载失败！', duration = 1500) {
	uni.showToast({
		title,
		duration,
		icon: 'none',
	})
}

// 关闭生产环境下的提示信息
Vue.config.productionTip = false

// 指定应用类型为 'app'
App.mpType = 'app'

// 创建 Vue 实例并挂载 store
const app = new Vue({
    ...App,
	store
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import App from './App.vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif