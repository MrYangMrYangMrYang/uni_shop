export default {
  // 开启命名空间
  namespaced: true,

  // 数据
  state: () => ({
    // 读取本地的收货地址数据和token
    address: JSON.parse(uni.getStorageSync('address') || '{}'),
    // 地址列表
    addressList: JSON.parse(uni.getStorageSync('addressList') || '[]'),
    token: uni.getStorageSync('token') || '',
    // 用户的信息对象
    userinfo: JSON.parse(uni.getStorageSync('userinfo') || '{}'),
    // 订单列表
    orderList: JSON.parse(uni.getStorageSync('orderList') || '[]'),
    // 重定向的 Object 对象（用于返回未登录之前的页面）
    redirectInfo: null
  }),

  // 方法
  mutations: {
    // 更新收货地址 (当前选中的地址)
    updateAddress(state, address) {
      state.address = address
      this.commit('m_user/saveAddressToStorage')
    },
    // 持久化存储address
    saveAddressToStorage(state) {
      uni.setStorageSync('address', JSON.stringify(state.address))
    },
    // 新增地址
    addAddress(state, address) {
      // 自动生成ID
      address.id = Date.now()
      state.addressList.push(address)
      this.commit('m_user/saveAddressListToStorage')
    },
    // 编辑地址
    editAddress(state, address) {
      const i = state.addressList.findIndex(x => x.id === address.id)
      if (i !== -1) {
        state.addressList.splice(i, 1, address)
        this.commit('m_user/saveAddressListToStorage')
        // 如果编辑的是当前选中的地址，同步更新
        if (state.address.id === address.id) {
          state.address = address
          this.commit('m_user/saveAddressToStorage')
        }
      }
    },
    // 删除地址
    removeAddress(state, id) {
      state.addressList = state.addressList.filter(x => x.id !== id)
      this.commit('m_user/saveAddressListToStorage')
      // 如果删除的是当前选中的地址，重置选中
      if (state.address.id === id) {
        state.address = {}
        this.commit('m_user/saveAddressToStorage')
      }
    },
    // 持久化存储addressList
    saveAddressListToStorage(state) {
      uni.setStorageSync('addressList', JSON.stringify(state.addressList))
    },
    // 更新用户信息
    updateUserInfo(state, userinfo) {
      state.userinfo = userinfo

      this.commit('m_user/saveUserInfoToStorage')
    },
    // 持久化存储用户信息
    saveUserInfoToStorage(state) {
      uni.setStorageSync('userinfo', JSON.stringify(state.userinfo))
    },
    // 更新token
    updateToken(state, token) {
      state.token = token
      this.commit('m_user/saveTokenToStorage')
    },
    // 持久化token
    saveTokenToStorage(state) {
      uni.setStorageSync('token', state.token)
    },
    // 添加新订单
    addOrder(state, order) {
      state.orderList.unshift(order) // 新订单排在前面
      this.commit('m_user/saveOrderListToStorage')
    },
    // 持久化订单列表
    saveOrderListToStorage(state) {
      uni.setStorageSync('orderList', JSON.stringify(state.orderList))
    },
    // 检查并清理过期的未支付订单
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
	// 更新重定向的 Object 对象
    updateRedirectInfo(state, info) {
      state.redirectInfo = info
      // console.log(state.redirectInfo)
    }
  },

  getters: {
    // 用户收货地址
    addstr(state) {
      if (!state.address.provinceName) return ''
      return state.address.provinceName + state.address.cityName + state.address.countyName + state.address.detailInfo
    }
  }
}
