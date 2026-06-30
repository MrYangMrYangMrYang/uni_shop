/**
 * TabBar 徽标混入
 * 自动同步购物车数量到 TabBar 徽标，未登录时不展示
 * 用于所有带 TabBar 的页面（home, cate, cart, my）
 */

import { mapGetters, mapState } from 'vuex';

export default {
	computed: {
		...mapGetters('m_cart', ['total']),
		...mapState('m_user', ['token'])
	},
	watch: {
		total() {
			this.setBadge();
		},
		token() {
			this.setBadge();
		}
	},
	onShow() {
		this.setBadge();
	},
	methods: {
		setBadge() {
			// 购物车在 TabBar 中的索引为 2
			const cartIndex = 2;

			// 未登录时不展示购物车数据，保护隐私
			if (!this.token) {
				uni.removeTabBarBadge({
					index: cartIndex
				});
				return;
			}

			if (this.total === 0) {
				uni.removeTabBarBadge({
					index: cartIndex
				});
			} else {
				uni.setTabBarBadge({
					index: cartIndex,
					// text 必须是字符串
					text: this.total + ''
				});
			}
		}
	}
};
