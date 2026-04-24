export default {
  namespaced: true,

  state: () => ({
    // 购物车的数组，用来存储购物车中每个商品的信息对象
    // 每个商品的信息对象，都包含如下 6 个属性：
    // { goods_id, goods_name, goods_price, goods_count, goods_small_logo, goods_state }
	// 读取本地存储的购物车数据
    cart: JSON.parse(uni.getStorageSync('cart') || '[]')
  }),

  mutations: {
	// 将商品信息加入购物车
    addToCart(state, goods) {
	  // 根据提交的商品的Id，查询购物车中是否存在这件商品
	  // 如果不存在，则 findResult 为 undefined；否则，为查找到的商品信息对象
	  const findResult = state.cart.find(x => x.goods_id === goods.goods_id)

	  if (!findResult) {
		state.cart.push(goods)
	  } else {
		findResult.goods_count++
	  }

	  // 通过 commit 方法，调用 m_cart 命名空间下的 saveToStorage 方法
	  this.commit('m_cart/saveToStorage')
    },
	// 将购物车中的数据持久化存储到本地
    saveToStorage(state) {
      uni.setStorageSync('cart', JSON.stringify(state.cart))
    },
    // 更改购物车中商品的勾选状态
    updateGoodsState(state, goods) {
      const findResult = state.cart.find(x => x.goods_id === goods.goods_id)

      if (findResult) {
        findResult.goods_state = goods.goods_state

        this.commit('m_cart/saveToStorage')
      }
    },
    // 更新商品的数量
    updateGoodsCount(state, goods) {
      const findResult = state.cart.find(x => x.goods_id === goods.goods_id)

      if (findResult) {
        findResult.goods_count = goods.goods_count

        this.commit('m_cart/saveToStorage')
      }
    },
    // 根据 Id 删除对应的商品
    removeGoodsById(state, goods_id) {
      state.cart = state.cart.filter(x => x.goods_id !== goods_id)

      this.commit('m_cart/saveToStorage')
    },
    // 更新购物车中所有商品的勾选状态
    updateAllGoodsState(state, newState) {
      state.cart.forEach(x => x.goods_state = newState)

      this.commit('m_cart/saveToStorage')
    },
    // 清空购物车
    clearCart(state) {
      state.cart = []
      this.commit('m_cart/saveToStorage')
    },
    // 删除已勾选的商品
    removeCheckedGoods(state) {
      state.cart = state.cart.filter(x => !x.goods_state)
      this.commit('m_cart/saveToStorage')
    }
  },

  getters: {
    // 购物车中所有商品的总数量
    total(state) {
      // let c = 0
      // state.cart.forEach(x => c += x.goods_count)
      // return c
      return state.cart.reduce((total, item) => total += item.goods_count, 0)
    },
    // 购物车中已勾选商品的总数量
    checkedCount(state) {
		// 先使用 filter 方法，从购物车中过滤器已勾选的商品
		// 再使用 reduce 方法，将已勾选的商品总数量进行累加
		// reduce() 的返回值就是已勾选的商品的总数量
		return state.cart.filter(x => x.goods_state).reduce((total, item) => total += item.goods_count, 0)
    },
    // 已勾选商品的总价格
    checkedGoodsAmount(state) {
		// 先使用 filter 方法，从购物车中过滤器已勾选的商品
		// 再使用 reduce 方法，将已勾选的商品数量 * 单价之后，进行累加
		// reduce() 的返回值就是已勾选的商品的总价
		// 最后调用 toFixed(2) 方法，保留两位小数
		return state.cart.filter(x => x.goods_state).reduce((total, item) => total += item.goods_count * item.goods_price, 0).toFixed(2)
    }
  }
}
