/**
 * 购物车 Vuex 模块
 * 负责管理购物车数据的增删改查及本地持久化
 */
export default {
  // 开启命名空间，访问路径为 m_cart
  namespaced: true,

  /**
   * 模块状态数据
   */
  state: () => ({
    // 购物车的数组，用来存储购物车中每个商品的信息对象
    // 每个商品的信息对象结构：
    // { goods_id, goods_name, goods_price, goods_count, goods_small_logo, goods_state }
    // 初始化时从本地存储读取数据
    cart: JSON.parse(uni.getStorageSync('cart') || '[]')
  }),

  /**
   * 变更状态的方法
   */
  mutations: {
    /**
     * 将商品信息加入购物车
     * @param {Object} state 当前模块的 state
     * @param {Object} goods 待添加的商品信息对象
     */
    addToCart(state, goods) {
      // 根据提交的商品的Id，查询购物车中是否存在这件商品
      const findResult = state.cart.find(x => x.goods_id === goods.goods_id)

      if (!findResult) {
        // 如果不存在，则直接 push
        state.cart.push(goods)
      } else {
        // 如果已存在，则只更新数量
        findResult.goods_count++
      }

      // 持久化存储到本地
      this.commit('m_cart/saveToStorage')
    },

    /**
     * 将购物车中的数据持久化存储到本地
     * @param {Object} state 当前模块的 state
     */
    saveToStorage(state) {
      uni.setStorageSync('cart', JSON.stringify(state.cart))
    },

    /**
     * 更改购物车中商品的勾选状态
     * @param {Object} state 当前模块的 state
     * @param {Object} goods 包含 goods_id 和 goods_state 的对象
     */
    updateGoodsState(state, goods) {
      const findResult = state.cart.find(x => x.goods_id === goods.goods_id)

      if (findResult) {
        findResult.goods_state = goods.goods_state
        // 持久化存储
        this.commit('m_cart/saveToStorage')
      }
    },

    /**
     * 更新商品的数量
     * @param {Object} state 当前模块的 state
     * @param {Object} goods 包含 goods_id 和 goods_count 的对象
     */
    updateGoodsCount(state, goods) {
      const findResult = state.cart.find(x => x.goods_id === goods.goods_id)

      if (findResult) {
        findResult.goods_count = goods.goods_count
        // 持久化存储
        this.commit('m_cart/saveToStorage')
      }
    },

    /**
     * 根据 Id 从购物车中删除对应的商品
     * @param {Object} state 当前模块的 state
     * @param {Number|String} goods_id 商品的 Id
     */
    removeGoodsById(state, goods_id) {
      state.cart = state.cart.filter(x => x.goods_id !== goods_id)
      // 持久化存储
      this.commit('m_cart/saveToStorage')
    },

    /**
     * 更新购物车中所有商品的勾选状态
     * @param {Object} state 当前模块的 state
     * @param {Boolean} newState 全选/全不选的状态
     */
    updateAllGoodsState(state, newState) {
      state.cart.forEach(x => x.goods_state = newState)
      // 持久化存储
      this.commit('m_cart/saveToStorage')
    },

    /**
     * 清空购物车
     * @param {Object} state 当前模块的 state
     */
    clearCart(state) {
      state.cart = []
      this.commit('m_cart/saveToStorage')
    },

    /**
     * 删除已勾选的商品
     * @param {Object} state 当前模块的 state
     */
    removeCheckedGoods(state) {
      state.cart = state.cart.filter(x => !x.goods_state)
      this.commit('m_cart/saveToStorage')
    }
  },

  /**
   * 基于 state 派生出的计算属性
   */
  getters: {
    /**
     * 购物车中所有商品的总数量
     * @param {Object} state 当前模块的 state
     * @returns {Number}
     */
    total(state) {
      return state.cart.reduce((total, item) => total += item.goods_count, 0)
    },

    /**
     * 购物车中已勾选商品的总数量
     * @param {Object} state 当前模块的 state
     * @returns {Number}
     */
    checkedCount(state) {
      // 先筛选已勾选的，再累加数量
      return state.cart.filter(x => x.goods_state).reduce((total, item) => total += item.goods_count, 0)
    },

    /**
     * 已勾选商品的总价格
     * @param {Object} state 当前模块的 state
     * @returns {String} 保留两位小数的总价格字符串
     */
    checkedGoodsAmount(state) {
      // 筛选已勾选的 -> 累加 (单价 * 数量) -> 保留两位小数
      return state.cart.filter(x => x.goods_state)
                       .reduce((total, item) => total += item.goods_count * item.goods_price, 0)
                       .toFixed(2)
    }
  }
}
