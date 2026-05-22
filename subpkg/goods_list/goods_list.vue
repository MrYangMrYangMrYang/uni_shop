/**
 * 商品列表页面
 * 展示分类下的商品列表，支持搜索、排序、瀑布流展示、分页加载和下拉刷新
 */
<template>
	<view class="u-page u-page--page goods-list-page">
		<!-- 筛选功能区域 -->
		<view class="list-header u-card--shadow">
			<view class="filter-box">
				<!-- 循环渲染筛选列表项 -->
				<view :class="['filter-item', i === activeFilter ? 'active' : '']" v-for="(item, i) in filterList" :key="i" @click="filterChanged(i)">
					{{item === '品牌' ? selectedBrand : (item === '店铺' ? selectedShop : item)}}
					<!-- 下拉箭头：仅在“综合”、“品牌”、“店铺”项显示 -->
					<view class="filter-arrow" v-if="item !== '销量'">
						<uni-icons :type="showDropdown && currentDropdownType === item ? 'top' : 'bottom'" size="12" :color="activeFilter === i ? '#C00000' : '#909399'"></uni-icons>
					</view>
				</view>

				<!-- 统一的下拉菜单容器 -->
				<view class="filter-dropdown" v-if="showDropdown" @click.stop>
					<!-- 综合/价格排序下拉内容 -->
					<block v-if="currentDropdownType === '综合'">
						<view :class="['dropdown-item', sortType === 'all' ? 'active' : '']" @click="selectSortOption('sortType', 'all')">
							综合排序
							<uni-icons type="checkmarkempty" size="14" color="#C00000" v-if="sortType === 'all'"></uni-icons>
						</view>
						<view :class="['dropdown-item', sortType === 'price-asc' ? 'active' : '']" @click="selectSortOption('sortType', 'price-asc')">
							价格从低到高
							<uni-icons type="checkmarkempty" size="14" color="#C00000" v-if="sortType === 'price-asc'"></uni-icons>
						</view>
						<view :class="['dropdown-item', sortType === 'price-desc' ? 'active' : '']" @click="selectSortOption('sortType', 'price-desc')">
							价格从高到低
							<uni-icons type="checkmarkempty" size="14" color="#C00000" v-if="sortType === 'price-desc'"></uni-icons>
						</view>
					</block>

					<!-- 品牌筛选下拉内容 -->
					<block v-if="currentDropdownType === '品牌'">
						<view :class="['dropdown-item', selectedBrand === item ? 'active' : '']" v-for="(item, index) in brandList" :key="index" @click="selectSortOption('selectedBrand', item)">
							{{item}}
							<uni-icons type="checkmarkempty" size="14" color="#C00000" v-if="selectedBrand === item"></uni-icons>
						</view>
					</block>

					<!-- 店铺筛选下拉内容 -->
					<block v-if="currentDropdownType === '店铺'">
						<view :class="['dropdown-item', selectedShop === item ? 'active' : '']" v-for="(item, index) in shopList" :key="index" @click="selectSortOption('selectedShop', item)">
							{{item}}
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
				<view class="goods-list-item u-card--shadow u-pressable" v-for="(item, i) in leftList" :key="i" @click="gotoDetail(item)">
					<!-- 复用 my-goods 组件，开启网格展示模式 -->
					<my-goods :goods="item" :is-grid="true"></my-goods>
				</view>
			</view>
			<!-- 右侧瀑布流列 -->
			<view class="waterfall-column">
				<view class="goods-list-item u-card--shadow u-pressable" v-for="(item, i) in rightList" :key="i" @click="gotoDetail(item)">
					<my-goods :goods="item" :is-grid="true"></my-goods>
				</view>
			</view>
		</view>

		<!-- 空列表状态展示 -->
		<view class="empty u-card--shadow" v-if="!isloading && goodsList.length === 0">
			<text class="empty__title">暂无商品</text>
			<text class="empty__sub u-text-muted">试试下拉刷新或更换关键词</text>
		</view>

		<!-- 加载中提示 -->
		<view class="loading u-text-muted" v-if="isloading">
			加载中...
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 请求参数对象
				queryObj: {
					query: '',    // 搜索关键词
					cid: '',      // 商品分类 Id
					pagenum: 1,   // 页码值
					pagesize: 10  // 每页显示条数
				},
				// 扁平化的原始商品列表
				goodsList: [],
				// 瀑布流左侧列数据
				leftList: [],
				// 瀑布流右侧列数据
				rightList: [],
				// 商品总条数，用于分页判断
				total: 0,
				// 是否正在发起请求，用于节流
				isloading: false,
				// 当前激活的筛选索引
				activeFilter: 0,
				// 筛选项文字列表
				filterList: ['综合', '销量', '品牌', '店铺'],
				// 综合排序的子选项：all(默认), price-asc(升序), price-desc(降序)
				sortType: 'all',
				// 是否显示下拉筛选菜单
				showDropdown: false,
				// 当前显示的下拉菜单类型（对应 filterList 的项）
				currentDropdownType: '',
				// 演示品牌数据列表
				brandList: ['Sunny', 'Apple', 'Huawei', 'Xiaomi'],
				selectedBrand: '品牌',
				// 演示店铺数据列表
				shopList: ['官方旗舰店', '自营店', '第三方店铺'],
				selectedShop: '店铺'
			}
		},
		/**
		 * 页面加载钩子
		 * @param {Object} options 路由参数
		 */
		onLoad(options) {
			// 将页面参数转存到 queryObj 对象中
			this.queryObj.query = options.query || ''
			this.queryObj.cid = options.cid || ''
			
			// 获取初始商品列表
			this.getGoodsList()
		},
		methods: {
			/**
			 * 获取商品列表数据
			 * @param {Function} cb 请求结束后的回调函数
			 */
			async getGoodsList(cb) {
				// 开启节流阀
				this.isloading = true
				// 发起 HTTP GET 请求
				const { data: res } = await uni.$http.get('/api/public/v1/goods/search', this.queryObj)
				// 关闭节流阀
				this.isloading = false
				
				// 只要数据请求完毕，就立即按需调用 cb 回调函数（如停止下拉刷新）
				cb && cb()
				
				if (res.meta.status !== 200) return uni.$showMsg()
				
				// 拼接新获取的商品数据到列表
				this.goodsList = [...this.goodsList, ...res.message.goods]
				this.total = res.message.total
				
				// 将新数据动态分配到左右瀑布流列中
				this.distributeGoods(res.message.goods)
			},
			/**
			 * 瀑布流数据分配算法
			 * 总是将下一个商品分配给当前较短的一列，以维持视觉平衡
			 * @param {Array} newList 新获取的商品数组
			 */
			distributeGoods(newList) {
				newList.forEach((item, index) => {
					if (this.leftList.length <= this.rightList.length) {
						this.leftList.push(item)
					} else {
						this.rightList.push(item)
					}
				})
			},
			/**
			 * 跳转至商品详情页
			 * @param {Object} item 商品对象
			 */
			gotoDetail(item) {
				uni.navigateTo({
					url: '/subpkg/goods_detail/goods_detail?goods_id=' + item.goods_id
				})
			},
			/**
			 * 筛选项改变的处理逻辑
			 * @param {Number} i 点击的筛选项索引
			 */
			filterChanged(i) {
				const type = this.filterList[i]
				
				// 处理具备下拉菜单的项
				if (['综合', '品牌', '店铺'].includes(type)) {
					if (this.currentDropdownType === type) {
						this.showDropdown = !this.showDropdown
					} else {
						this.currentDropdownType = type
						this.showDropdown = true
					}
					this.activeFilter = i
					return
				}
				
				// 处理无下拉菜单的项（如：销量）
				this.showDropdown = false
				this.currentDropdownType = ''
				
				if (this.activeFilter === i) return
				this.activeFilter = i
				
				// 触发模拟排序逻辑
				this.sortGoodsList()
			},
			/**
			 * 选择下拉菜单中的具体选项
			 * @param {String} key 对应 data 中的键名
			 * @param {String} value 选中的值
			 */
			selectSortOption(key, value) {
				this[key] = value
				this.showDropdown = false
				this.sortGoodsList()
			},
			/**
			 * 模拟前端排序逻辑
			 * 实际项目中应清空列表并通过 API 带参重新查询
			 */
			sortGoodsList() {
				const type = this.filterList[this.activeFilter]
				
				if (type === '综合') {
					if (this.sortType === 'all') {
						// 综合排序：刷新列表以获取原始顺序
						this.refreshList()
						return
					} else {
						// 价格排序：前端模拟排序
						this.goodsList.sort((a, b) => {
							return this.sortType === 'price-desc' ? b.goods_price - a.goods_price : a.goods_price - b.goods_price
						})
					}
				} else if (type === '销量') {
					// 销量排序：前端模拟
					this.goodsList.sort((a, b) => (b.goods_id % 100) - (a.goods_id % 100))
				} else if (type === '品牌' || type === '店铺') {
					// 筛选模拟：随机过滤数据以演示 UI 变化
					this.goodsList = this.goodsList.filter(item => Math.random() > 0.2)
				}
				
				// 排序/筛选后，必须清空并重新分配瀑布流数据
				this.leftList = []
				this.rightList = []
				this.distributeGoods(this.goodsList)
			},
			/**
			 * 刷新列表数据（重置状态）
			 * @param {Function} cb 刷新完成后的回调
			 */
			refreshList(cb) {
				// 1. 重置所有分页和列表数据
				this.queryObj.pagenum = 1
				this.total = 0
				this.isloading = false
				this.goodsList = []
				this.leftList = []
				this.rightList = []
				// 2. 重新发起请求
				this.getGoodsList(cb)
			}
		},
		/**
		 * 页面触底生命周期
		 * 用于分页加载更多数据
		 */
		onReachBottom() {
			// 判断是否加载完所有数据
			if (this.queryObj.pagenum * this.queryObj.pagesize >= this.total)
				return uni.$showMsg('已经到底啦~')
			
			// 如果正在请求中，则直接返回，避免重复请求
			if (this.isloading) return
			
			// 页码累加并请求新数据
			this.queryObj.pagenum += 1
			this.getGoodsList()
		},
		/**
		 * 下拉刷新生命周期
		 */
		onPullDownRefresh() {
			this.refreshList(() => uni.stopPullDownRefresh())
		},
	}
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
			box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.15);
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

	/* 加载更多提示文字 */
	.loading {
		padding: $space-3 0;
		text-align: center;
		font-size: $font-sm;
	}
</style>
