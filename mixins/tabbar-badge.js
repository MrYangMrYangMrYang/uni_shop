// 将设置 tabBar 徽标的代码抽离为 mixins
import { mapGetters } from 'vuex'

// 导出一个 mixin 对象
export default {
  computed: {
    ...mapGetters('m_cart', ['total'])
  },
  watch: {
	// 监听 total 值的变化
    total() {
      this.setBadge()
    }
  },
  // 在页面刚展示的时候，设置数字徽标
  onShow() {
    this.setBadge()
  },
  methods: {
    setBadge() {
	  // 调用 uni.setTabBarBadge() 和 uni.removeTabBarBadge()，为购物车设置和移除右上角的徽标
      if (this.total === 0) {
            // 如果数量为0，移除徽标
            uni.removeTabBarBadge({
              index: 2
            })
        } else {
            // 如果数量大于0，设置徽标
            uni.setTabBarBadge({
              index: 2,
              text: this.total + ''  // 确保是字符串
            })
        }
    }
  }
}
