/** * 商品列表页面 * 展示分类下的商品列表，支持搜索、排序、瀑布流展示、分页加载和下拉刷新 */
<template>
	<view class="u-page u-page--page goods-list-page">
		<!-- 筛选功能区域 -->
		<view class="list-header u-card--shadow">
			<view class="filter-box">
				<view
					:class="['filter-item', i === activeFilter ? 'active' : '']"
					v-for="(item, i) in filterList"
					:key="i"
					@click="filterChanged(i)"
				>
					{{ item === '品牌' ? selectedBrand : item === '店铺' ? selectedShop : item }}
					<!-- 下拉箭头：仅在“综合”、“品牌”、“店铺”项显示 -->
					<view class="filter-arrow" v-if="item !== '销量'">
						<uni-icons
							:type="showDropdown && currentDropdownType === item ? 'top' : 'bottom'"
							size="12"
							:color="activeFilter === i ? '#C00000' : '#909399'"
						></uni-icons>
					</view>
				</view>

				<!-- 统一的下拉菜单容器 -->
				<view class="filter-dropdown" v-if="showDropdown" @click.stop>
					<!-- 综合/价格排序下拉内容 -->
					<block v-if="currentDropdownType === '综合'">
						<view
							:class="['dropdown-item', sortType === 'all' ? 'active' : '']"
							@click="selectSortOption('sortType', 'all')"
						>
							综合排序
							<uni-icons type="checkmarkempty" size="14" color="#C00000" v-if="sortType === 'all'"></uni-icons>
						</view>
						<view
							:class="['dropdown-item', sortType === 'price-asc' ? 'active' : '']"
							@click="selectSortOption('sortType', 'price-asc')"
						>
							价格从低到高
							<uni-icons type="checkmarkempty" size="14" color="#C00000" v-if="sortType === 'price-asc'"></uni-icons>
						</view>
						<view
							:class="['dropdown-item', sortType === 'price-desc' ? 'active' : '']"
							@click="selectSortOption('sortType', 'price-desc')"
						>
							价格从高到低
							<uni-icons type="checkmarkempty" size="14" color="#C00000" v-if="sortType === 'price-desc'"></uni-icons>
						</view>
					</block>

					<!-- 品牌筛选下拉内容 -->
					<block v-if="currentDropdownType === '品牌'">
						<view
							:class="['dropdown-item', selectedBrand === item ? 'active' : '']"
							v-for="(item, index) in brandList"
							:key="index"
							@click="selectSortOption('selectedBrand', item)"
						>
							{{ item }}
							<uni-icons type="checkmarkempty" size="14" color="#C00000" v-if="selectedBrand === item"></uni-icons>
						</view>
					</block>

					<!-- 店铺筛选下拉内容 -->
					<block v-if="currentDropdownType === '店铺'">
						<view
							:class="['dropdown-item', selectedShop === item ? 'active' : '']"
							v-for="(item, index) in shopList"
							:key="index"
							@click="selectSortOption('selectedShop', item)"
						>
							{{ item }}
							<uni-icons type="checkmarkempty" size="14" color="#C00000" v-if="selectedShop === item"></uni-icons>
						</view>
					</block>
				</view>
			</view>
			<!-- 遮罩层：点击背景关闭下拉菜单 -->
			<view class="dropdown-mask" v-if="showDropdown" @click="showDropdown = false"></view>
		</view>

		<!-- 商品列表展示区域（瀑布流布局） -->
		<view class="goods-list" v-if="goodsList.length > 0">
			<!-- 左侧瀑布流列 -->
			<view class="waterfall-column">
				<view
					class="goods-list-item u-card--shadow u-pressable"
					v-for="(item, i) in leftList"
					:key="i"
					@click="gotoDetail(item)"
				>
					<my-goods :goods="item" :is-grid="true"></my-goods>
				</view>
			</view>
			<!-- 右侧瀑布流列 -->
			<view class="waterfall-column">
				<view
					class="goods-list-item u-card--shadow u-pressable"
					v-for="(item, i) in rightList"
					:key="i"
					@click="gotoDetail(item)"
				>
					<my-goods :goods="item" :is-grid="true"></my-goods>
				</view>
			</view>
		</view>

		<!-- 空列表状态展示 -->
		<view class="empty u-card--shadow" v-if="!isloading && goodsList.length === 0">
			<text class="empty__title">暂无商品</text>
			<text class="empty__sub u-text-muted">试试下拉刷新或更换关键词</text>
		</view>

		<!-- 加载中骨架屏 -->
		<view v-if="isloading" class="skeleton-goods-list">
			<u-skeleton mode="card" :rows="4" />
		</view>
	</view>
</template>

<script>
import USkeleton from '@/components/u-skeleton/u-skeleton.vue';
import { searchGoods } from '@/api/goods.js';

export default {
	components: {
		'u-skeleton': USkeleton
	},
	data() {
		return {
			queryObj: {
				query: '',
				cid: '',
				pagenum: 1,
				pagesize: 10
			},
			goodsList: [],
			leftList: [],
			rightList: [],
			total: 0,
			// 节流锁：请求中为 true，避免重复发起
			isloading: false,
			activeFilter: 0,
			filterList: ['综合', '销量', '品牌', '店铺'],
			// 综合排序子项：all(默认) / price-asc(升序) / price-desc(降序)
			sortType: 'all',
			showDropdown: false,
			currentDropdownType: '',
			// 演示品牌数据
			brandList: ['Sunny', 'Apple', 'Huawei', 'Xiaomi'],
			selectedBrand: '品牌',
			// 演示店铺数据
			shopList: ['官方旗舰店', '自营店', '第三方店铺'],
			selectedShop: '店铺'
		};
	},
	onLoad(options) {
		this.queryObj.query = options.query || '';
		this.queryObj.cid = options.cid || '';
		this.getGoodsList();
	},
	methods: {
		// cb 为请求完成回调（如下拉刷新停止）
		async getGoodsList(cb) {
			this.isloading = true;
			const { data: res } = await searchGoods(this.queryObj);
			this.isloading = false;

			cb && cb();

			if (res.meta.status !== 200) return uni.$showMsg();

			this.goodsList = [...this.goodsList, ...res.message.goods];
			this.total = res.message.total;

			this.distributeGoods(res.message.goods);
		},
		// 瀑布流分配：总是把下一条商品放入当前较短的一列，维持视觉平衡
		distributeGoods(newList) {
			newList.forEach(item => {
				if (this.leftList.length <= this.rightList.length) {
					this.leftList.push(item);
				} else {
					this.rightList.push(item);
				}
			});
		},
		gotoDetail(item) {
			uni.navigateTo({
				url: '/subpkg/goods_detail/goods_detail?goods_id=' + item.goods_id
			});
		},
		filterChanged(i) {
			const type = this.filterList[i];

			// 带下拉菜单的项
			if (['综合', '品牌', '店铺'].includes(type)) {
				if (this.currentDropdownType === type) {
					this.showDropdown = !this.showDropdown;
				} else {
					this.currentDropdownType = type;
					this.showDropdown = true;
				}
				this.activeFilter = i;
				return;
			}

			// 无下拉菜单的项（如：销量）
			this.showDropdown = false;
			this.currentDropdownType = '';

			if (this.activeFilter === i) return;
			this.activeFilter = i;

			this.sortGoodsList();
		},
		selectSortOption(key, value) {
			this[key] = value;
			this.showDropdown = false;
			this.sortGoodsList();
		},
		// 前端模拟排序：实际项目应清空列表带参重新请求接口
		sortGoodsList() {
			const type = this.filterList[this.activeFilter];

			if (type === '综合') {
				if (this.sortType === 'all') {
					this.refreshList();
					return;
				} else {
					this.goodsList.sort((a, b) => {
						return this.sortType === 'price-desc' ? b.goods_price - a.goods_price : a.goods_price - b.goods_price;
					});
				}
			} else if (type === '销量') {
				this.goodsList.sort((a, b) => (b.goods_id % 100) - (a.goods_id % 100));
			} else if (type === '品牌' || type === '店铺') {
				// 演示行为：后端接口不提供品牌/店铺字段，此处保持全量商品不做随机过滤
				// 实际项目应通过 API 参数 brand/shop 重新请求接口
			}

			// 排序/筛选后需清空并重新分配瀑布流
			this.leftList = [];
			this.rightList = [];
			this.distributeGoods(this.goodsList);
		},
		refreshList(cb) {
			this.queryObj.pagenum = 1;
			this.total = 0;
			this.isloading = false;
			this.goodsList = [];
			this.leftList = [];
			this.rightList = [];
			this.getGoodsList(cb);
		}
	},
	onReachBottom() {
		if (this.queryObj.pagenum * this.queryObj.pagesize >= this.total) return uni.$showMsg('已经到底啦~');

		if (this.isloading) return;

		this.queryObj.pagenum += 1;
		this.getGoodsList();
	},
	onPullDownRefresh() {
		this.refreshList(() => uni.stopPullDownRefresh());
	}
};
</script>

<style lang="scss">
/* 页面容器样式 */
.goods-list-page {
	padding: 0 $space-2;
}

/* 筛选头部容器样式 */
.list-header {
	padding: $space-2 $space-1;
	margin: $space-2 0;
}

/* 筛选栏 Flex 布局 */
.filter-box {
	display: flex;
	justify-content: space-around;
	position: relative;

	.filter-item {
		font-size: $font-md;
		color: $color-text-500;
		display: flex;
		align-items: center;
		gap: 4rpx;
		padding: $space-1 $space-2;
		border-radius: $radius-sm;
		transition: all 0.2s;

		&.active {
			color: $color-primary-600;
			font-weight: 700;
		}

		.filter-arrow {
			display: flex;
			align-items: center;
			justify-content: center;
			line-height: 1;
			margin-left: 2rpx;
		}
	}

	/* 下拉菜单弹出层样式 */
	.filter-dropdown {
		position: absolute;
		top: 100%;
		left: $space-2;
		right: $space-2;
		background-color: #fff;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.15);
		border-radius: $radius-md;
		z-index: 1001;
		margin-top: $space-2;
		padding: $space-1 0;
		overflow: hidden;
		animation: slideDown 0.2s ease-out;

		.dropdown-item {
			padding: $space-3 $space-4;
			font-size: $font-sm;
			color: $color-text-700;
			display: flex;
			justify-content: space-between;
			align-items: center;
			transition: background 0.2s;

			&:active {
				background-color: $color-bg-soft;
			}

			&.active {
				color: $color-primary-600;
				font-weight: 600;
			}
		}
	}
}

/* 遮罩层：透明但拦截点击 */
.dropdown-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1000;
	background-color: transparent;
}

/* 下拉菜单动画 */
@keyframes slideDown {
	from {
		opacity: 0;
		transform: translateY(-10rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* 瀑布流容器样式 */
.goods-list {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding: 0 0 $space-2;
	gap: $space-2;
	width: 100%;
	box-sizing: border-box;

	.waterfall-column {
		flex: 1;
		width: 0; // 强制 flex 子项不撑破容器
		display: flex;
		flex-direction: column;
		gap: $space-2;
	}
}

/* 商品卡片项容器 */
.goods-list-item {
	width: 100%;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	background-color: #fff;
}

/* 空状态布局 */
.empty {
	padding: $space-6 $space-3;
	text-align: center;

	.empty__title {
		font-size: $font-md;
		font-weight: 700;
		color: $color-text-900;
	}

	.empty__sub {
		display: block;
		margin-top: $space-2;
		font-size: $font-sm;
	}
}

/* 加载中骨架屏 */
.skeleton-goods-list {
	padding: 0 $space-2;
}
/* 加载更多提示文字 */
.loading {
	padding: $space-3 0;
	text-align: center;
	font-size: $font-sm;
}
</style>
