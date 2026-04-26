/**
 * 用户 Vuex 模块
 * 负责管理用户信息、收货地址、登录状态及订单数据
 */
export default {
  // 开启命名空间，访问路径为 m_user
  namespaced: true,

  /**
   * 模块状态数据
   */
  state: () => ({
    // 当前选中的收货地址，从本地存储读取
    address: JSON.parse(uni.getStorageSync('address') || '{}'),
    // 用户的收货地址列表
    addressList: JSON.parse(uni.getStorageSync('addressList') || '[]'),
    // 登录成功后的 token 字符串
    token: uni.getStorageSync('token') || '',
    // 用户的信息对象
    userinfo: JSON.parse(uni.getStorageSync('userinfo') || '{}'),
    // 用户的历史订单列表
    orderList: JSON.parse(uni.getStorageSync('orderList') || '[]'),
    // 登录后的重定向信息（用于在登录后返回之前的页面）
    redirectInfo: null
  }),

  /**
   * 变更状态的方法
   */
  mutations: {
    /**
     * 更新当前选中的收货地址
     * @param {Object} state 当前模块的 state
     * @param {Object} address 地址对象
     */
    updateAddress(state, address) {
      state.address = address
      this.commit('m_user/saveAddressToStorage')
    },

    /**
     * 将当前选中的地址持久化存储到本地
     * @param {Object} state 当前模块的 state
     */
    saveAddressToStorage(state) {
      uni.setStorageSync('address', JSON.stringify(state.address))
    },

    /**
     * 新增收货地址到地址列表
     * @param {Object} state 当前模块的 state
     * @param {Object} address 新增的地址对象
     */
    addAddress(state, address) {
      // 简单模拟生成唯一 ID
      address.id = Date.now()
      // 如果新地址设置为默认地址，则取消其他地址的默认状态
      if (address.isDefault) {
        state.addressList.forEach(x => x.isDefault = false)
      }
      state.addressList.push(address)
      this.commit('m_user/saveAddressListToStorage')
    },

    /**
     * 编辑已有的收货地址
     * @param {Object} state 当前模块的 state
     * @param {Object} address 修改后的地址对象
     */
    editAddress(state, address) {
      const i = state.addressList.findIndex(x => x.id === address.id)
      if (i !== -1) {
        // 如果设置为默认地址，则取消其他地址的默认状态
        if (address.isDefault) {
          state.addressList.forEach(x => x.isDefault = false)
        }
        state.addressList.splice(i, 1, address)
        this.commit('m_user/saveAddressListToStorage')
        
        // 如果编辑的是当前正在使用的地址，则同步更新
        if (state.address.id === address.id) {
          state.address = address
          this.commit('m_user/saveAddressToStorage')
        }
      }
    },

    /**
     * 从地址列表中删除地址
     * @param {Object} state 当前模块的 state
     * @param {Number|String} id 地址 ID
     */
    removeAddress(state, id) {
      state.addressList = state.addressList.filter(x => x.id !== id)
      this.commit('m_user/saveAddressListToStorage')
      
      // 如果删除的是当前选中的地址，则重置选中状态
      if (state.address.id === id) {
        state.address = {}
        this.commit('m_user/saveAddressToStorage')
      }
    },

    /**
     * 将地址列表持久化存储到本地
     * @param {Object} state 当前模块的 state
     */
    saveAddressListToStorage(state) {
      uni.setStorageSync('addressList', JSON.stringify(state.addressList))
    },

    /**
     * 更新用户信息
     * @param {Object} state 当前模块 state
     * @param {Object} userinfo 用户信息对象
     */
    updateUserInfo(state, userinfo) {
      state.userinfo = userinfo
      this.commit('m_user/saveUserInfoToStorage')
    },

    /**
     * 将用户信息持久化存储到本地
     * @param {Object} state 当前模块 state
     */
    saveUserInfoToStorage(state) {
      uni.setStorageSync('userinfo', JSON.stringify(state.userinfo))
    },

    /**
     * 更新登录 token
     * @param {Object} state 当前模块 state
     * @param {String} token 登录凭证
     */
    updateToken(state, token) {
      state.token = token
      this.commit('m_user/saveTokenToStorage')
    },

    /**
     * 将 token 持久化存储到本地
     * @param {Object} state 当前模块 state
     */
    saveTokenToStorage(state) {
      uni.setStorageSync('token', state.token)
    },

    /**
     * 添加新订单到订单列表
     * @param {Object} state 当前模块 state
     * @param {Object} order 订单对象
     */
    addOrder(state, order) {
      // 新订单插入到列表最前面
      state.orderList.unshift(order)
      this.commit('m_user/saveOrderListToStorage')
    },

    /**
     * 将订单列表持久化存储到本地
     * @param {Object} state 当前模块 state
     */
    saveOrderListToStorage(state) {
      uni.setStorageSync('orderList', JSON.stringify(state.orderList))
    },

    /**
     * 检查并清理过期的未支付订单
     * @param {Object} state 当前模块 state
     */
    checkAndCleanOrders(state) {
      const now = Date.now()
      const originalLength = state.orderList.length
      // 仅针对状态为 0 (待付款) 且超过过期时间的订单进行清理
      state.orderList = state.orderList.filter(order => {
        if (order.status === 0 && order.expire_time && now > order.expire_time) {
          return false
        }
        return true
      })

      if (state.orderList.length !== originalLength) {
        this.commit('m_user/saveOrderListToStorage')
      }
    },

    /**
     * 更新登录后的重定向信息
     * @param {Object} state 当前模块 state
     * @param {Object} info 包含 openType, from 等信息的对象
     */
    updateRedirectInfo(state, info) {
      state.redirectInfo = info
    },

    /**
     * 更新订单状态
     * @param {Object} state 当前模块 state
     * @param {Object} payload 包含 order_id 和 status 的对象
     */
    updateOrderStatus(state, { order_id, status }) {
      const i = state.orderList.findIndex(x => x.order_id === order_id)
      if (i !== -1) {
        state.orderList[i].status = status
        this.commit('m_user/saveOrderListToStorage')
      }
    },

    /**
     * 取消订单
     * @param {Object} state 当前模块 state
     * @param {String|Number} order_id 订单 ID
     */
    cancelOrder(state, order_id) {
      state.orderList = state.orderList.filter(x => x.order_id !== order_id)
      this.commit('m_user/saveOrderListToStorage')
    }
  },

  /**
   * 基于 state 派生出的计算属性
   */
  getters: {
    /**
     * 拼接完整的收货地址字符串
     * @param {Object} state 当前模块 state
     * @returns {String} 完整的地址描述
     */
    addstr(state) {
      if (!state.address.provinceName) return ''
      // 拼接：省 + 市 + 区 + 详细地址
      return state.address.provinceName + state.address.cityName + state.address.countyName + state.address.detailInfo
    },

    /**
     * 获取默认地址
     * @param {Object} state 当前模块 state
     * @returns {Object|null} 默认地址对象
     */
    defaultAddress(state) {
      return state.addressList.find(x => x.isDefault) || null
    },

    /**
     * 订单状态数量统计
     * @param {Object} state 当前模块 state
     * @returns {Object} 各状态订单的数量
     */
    orderCounts(state) {
      const counts = {
        pendingPayment: 0,
        toShip: 0,
        toReceive: 0,
        completed: 0,
        afterSales: 0
      }
      state.orderList.forEach(order => {
        if (order.status === 0) counts.pendingPayment++
        else if (order.status === 1) counts.toShip++
        else if (order.status === 2) counts.toReceive++
        else if (order.status === 3) counts.completed++
        else if (order.status === 4) counts.afterSales++
      })
      return counts
    }
  }
}
