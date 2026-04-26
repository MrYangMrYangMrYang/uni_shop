/**
 * Vuex 状态管理中心
 * 整合所有业务模块，统一管理全局数据状态
 */
import Vue from 'vue'
import Vuex from 'vuex'
// 导入购物车模块
import moduleCart from '@/store/cart.js'
// 导入用户模块
import moduleUser from '@/store/user.js'

// 安装 Vuex 插件
Vue.use(Vuex)

// 创建 Store 实例
const store = new Vuex.Store({
  // 挂载模块
  modules: {
    // 购物车模块：命名空间为 m_cart
    'm_cart': moduleCart,
    // 用户模块：命名空间为 m_user
    'm_user': moduleUser
  }
})

export default store
