/**
 * TabBar 徽标混入
 * 
 * 作用：
 * 1. 自动计算并显示购物车商品的数量徽标
 * 2. 实时监听购物车数量变化并更新徽标
 * 3. 封装通用的 setBadge 方法供页面使用
 * 
 * 使用说明：
 * 在所有带有 TabBar 的页面（home, cate, cart, my）中引入此 mixin
 */

import { mapGetters } from 'vuex'

// 导出一个 mixin 对象
export default {
  computed: {
    // 将 m_cart 模块中的 total 映射为当前组件的计算属性
    ...mapGetters('m_cart', ['total'])
  },
  watch: {
    /**
     * 监听 total 值的变化
     * 当购物车商品总数发生变化时，重新设置数字徽标
     */
    total() {
      this.setBadge()
    }
  },
  /**
   * 页面刚展示时的生命周期函数
   * 确保用户进入页面时能看到最新的徽标数量
   */
  onShow() {
    this.setBadge()
  },
  methods: {
    /**
     * 设置或移除 TabBar 徽标
     * 根据当前购物车商品总数，调用 uni 接口进行 UI 更新
     */
    setBadge() {
      // 购物车在 TabBar 中的索引为 2
      const cartIndex = 2
      
      if (this.total === 0) {
        // 如果数量为 0，移除徽标
        uni.removeTabBarBadge({
          index: cartIndex
        })
      } else {
        // 如果数量大于 0，设置徽标
        uni.setTabBarBadge({
          index: cartIndex,
          // 注意：text 必须是字符串
          text: this.total + ''
        })
      }
    }
  }
}
