<template>
	<view class="u-page u-page--page goods-list-page">
		<view class="list-header u-card--shadow">
			<!-- 筛选功能区域 -->
			<view class="filter-box">
				<view :class="['filter-item', i === activeFilter ? 'active' : '']" v-for="(item, i) in filterList" :key="i" @click="filterChanged(i)">
					{{item === '品牌' ? selectedBrand : (item === '店铺' ? selectedShop : item)}}
					<view class="filter-arrow" v-if="item !== '销量'">
						<uni-icons :type="showDropdown && currentDropdownType === item ? 'top' : 'bottom'" size="12" :color="activeFilter === i ? '#C00000' : '#909399'"></uni-icons>
					</view>
				</view>

				<!-- 统一的下拉菜单容器 -->
				<view class="filter-dropdown" v-if="showDropdown" @click.stop>
					<!-- 综合/价格下拉 -->
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

					<!-- 品牌下拉 -->
					<block v-if="currentDropdownType === '品牌'">
						<view :class="['dropdown-item', selectedBrand === item ? 'active' : '']" v-for="(item, index) in brandList" :key="index" @click="selectSortOption('selectedBrand', item)">
							{{item}}
							<uni-icons type="checkmarkempty" size="14" color="#C00000" v-if="selectedBrand === item"></uni-icons>
						</view>
					</block>

					<!-- 店铺下拉 -->
					<block v-if="currentDropdownType === '店铺'">
						<view :class="['dropdown-item', selectedShop === item ? 'active' : '']" v-for="(item, index) in shopList" :key="index" @click="selectSortOption('selectedShop', item)">
							{{item}}
							<uni-icons type="checkmarkempty" size="14" color="#C00000" v-if="selectedShop === item"></uni-icons>
						</view>
					</block>
				</view>
			</view>
			<!-- 遮罩层 -->
			<view class="dropdown-mask" v-if="showDropdown" @click="showDropdown = false"></view>
		</view>

		<view class="goods-list" v-if="goodsList.length > 0">
			<view class="waterfall-column">
				<view class="goods-list-item u-card--shadow u-pressable" v-for="(item, i) in leftList" :key="i" @click="gotoDetail(item)">
					<my-goods :goods="item" :is-grid="true"></my-goods>
				</view>
			</view>
			<view class="waterfall-column">
				<view class="goods-list-item u-card--shadow u-pressable" v-for="(item, i) in rightList" :key="i" @click="gotoDetail(item)">
					<my-goods :goods="item" :is-grid="true"></my-goods>
				</view>
			</view>
		</view>

		<view class="empty u-card--shadow" v-if="!isloading && goodsList.length === 0">
			<text class="empty__title">暂无商品</text>
			<text class="empty__sub u-text-muted">试试下拉刷新或更换关键词</text>
		</view>

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
					// 查询关键词
					query: '',
					// 商品分类Id
					cid: '',
					// 页码值
					pagenum: 1,
					// 每页显示多少条数据
					pagesize: 10
				},
				// 商品列表的数据
				goodsList: [],
				// 左右列数据
				leftList: [],
				rightList: [],
				// 总数量，用来实现分页
				total: 0,
				// 是否正在请求数据
				isloading: false,
				// 当前激活的筛选索引
				activeFilter: 0,
				// 筛选列表
				filterList: ['综合', '销量', '品牌', '店铺'],
				// 排序类型：all(综合), price-asc(价格升序), price-desc(价格降序)
				sortType: 'all',
				// 是否显示下拉菜单
				showDropdown: false,
				// 当前显示的下拉菜单类型
				currentDropdownType: '',
				// 品牌列表
				brandList: ['Sunny', 'Apple', 'Huawei', 'Xiaomi'],
				selectedBrand: '品牌',
				// 店铺列表
				shopList: ['官方旗舰店', '自营店', '第三方店铺'],
				selectedShop: '店铺'
			}
		},
		onLoad(options) {
			// 将页面参数转存到 this.queryObj 对象中
			this.queryObj.query = options.query || ''
			this.queryObj.cid = options.cid || ''
			
			// 调用获取商品列表数据的方法
			this.getGoodsList()
		},
		methods: {
			// 获取商品列表数据的方法
			async getGoodsList(cb) {
				// 打开节流阀
				this.isloading = true
				// 发起请求
				const { data: res } = await uni.$http.get('/api/public/v1/goods/search', this.queryObj)
				// 关闭节流阀
				this.isloading = false
				// 只要数据请求完毕，就立即按需调用 cb 回调函数，关闭下拉刷新
				cb && cb()
				if (res.meta.status !== 200) return uni.$showMsg()
				// 为数据赋值：通过展开运算符的形式，进行新旧数据的拼接
				this.goodsList = [...this.goodsList, ...res.message.goods]
				this.total = res.message.total
				
				// 分配新数据到左右列
				this.distributeGoods(res.message.goods)
			},
			// 分配商品到左右列
			distributeGoods(newList) {
				newList.forEach((item, index) => {
					// 简单平衡算法：交替分配，或者可以根据实际业务需求优化
					if (this.leftList.length <= this.rightList.length) {
						this.leftList.push(item)
					} else {
						this.rightList.push(item)
					}
				})
			},
			// 点击跳转到商品详情页面
			gotoDetail(item) {
				uni.navigateTo({
					url: '/subpkg/goods_detail/goods_detail?goods_id=' + item.goods_id
				})
			},
			// 筛选项改变的事件处理函数
			filterChanged(i) {
				const type = this.filterList[i]
				
				// 如果点击的是有下拉菜单的项
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
				
				// 点击销量等无下拉项
				this.showDropdown = false
				this.currentDropdownType = ''
				
				if (this.activeFilter === i) return
				this.activeFilter = i
				
				// 重新排序逻辑
				this.sortGoodsList()
			},
			// 选择下拉菜单中的选项
			selectSortOption(key, value) {
				this[key] = value
				this.showDropdown = false
				this.sortGoodsList()
			},
			// 对商品列表进行排序
			sortGoodsList() {
				const type = this.filterList[this.activeFilter]
				
				if (type === '综合') {
					if (this.sortType === 'all') {
						// 综合排序恢复原始获取顺序
						this.refreshList()
						return
					} else {
						// 价格排序
						this.goodsList.sort((a, b) => {
							return this.sortType === 'price-desc' ? b.goods_price - a.goods_price : a.goods_price - b.goods_price
						})
					}
				} else if (type === '销量') {
					// 模拟销量排序
					this.goodsList.sort((a, b) => (b.goods_id % 100) - (a.goods_id % 100))
				} else if (type === '品牌' || type === '店铺') {
					// 品牌和店铺筛选逻辑（由于 API 不支持，这里做前端模拟：随机过滤掉一些数据）
					this.goodsList = this.goodsList.filter(item => Math.random() > 0.2)
				}
				
				// 排序后重新分配左右列
				this.leftList = []
				this.rightList = []
				this.distributeGoods(this.goodsList)
			},
			// 刷新列表数据
			refreshList(cb) {
				// 1. 重置关键数据
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
		// 上拉加载
		onReachBottom() {
			// 判断是否还有下一页数据
			if (this.queryObj.pagenum * this.queryObj.pagesize >= this.total)
			return uni.$showMsg('数据加载完毕！')
			
			// 判断是否正在请求其它数据，如果是，则不发起额外的请求
			if (this.isloading) return
			// 让页码值自增 +1
			this.queryObj.pagenum += 1
			// 重新获取列表数据
			this.getGoodsList()
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.refreshList(() => uni.stopPullDownRefresh())
		},
	}
</script>

<style lang="scss">
	.goods-list-page {
		padding: 0 $space-2;
	}

	.list-header {
		padding: $space-2 $space-1;
		margin: $space-2 0;
	}

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

	.dropdown-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1000;
		background-color: transparent;
	}

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
			width: 0; // 防止内容撑开容器
			display: flex;
			flex-direction: column;
			gap: $space-2;
		}
	}

	.goods-list-item {
		width: 100%;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		background-color: #fff;
	}

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

	.loading {
		padding: $space-3 0;
		text-align: center;
		font-size: $font-sm;
	}
</style>
