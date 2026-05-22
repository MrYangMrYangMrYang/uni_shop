/**
 * 首页
 * 展示轮播图、分类导航、楼层商品等核心内容
 */
<template>
	<view class="u-page u-page--page">
		<!-- 搜索区域：始终固定在顶部 -->
		<view class="search-bar">
			<my-search @click="gotoSearch"></my-search>
		</view>
		<!-- 永久占位，防止内容上移 -->
		<view class="search-spacer"></view>
		
		<!-- 轮播图区域 -->
		<swiper :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000" :circular="true" indicator-active-color="#C00000">
			<!-- 循环渲染轮播图的 item 项 -->
			<swiper-item v-for="(item, i) in swiperList" :key="i">
				<navigator class="swiper-item u-pressable" url="/pages/cate/cate" open-type="switchTab">
					<image :src="item.image_src"></image>
				</navigator>
			</swiper-item>
		</swiper>

		<!-- 推荐标题区域 -->
		<view class="section-title">
			<text class="section-title__main">为你推荐</text>
			<text class="section-title__sub">精选好物 · 今日上新</text>
		</view>
		
		<!-- 分类导航区域 -->
		<view class="nav-list u-card--shadow">
			<view class="nav-item u-pressable" v-for="(item, i) in navList" :key="i" @click="navClickHandler(item)">
				<view class="nav-icon">
					<image :src="item.image_src" class="nav-img"></image>
				</view>
				<text class="nav-text">{{ item.name }}</text>
			</view>
		</view>
		
		<!-- 楼层展示区域 -->
		<view class="floor-list">
			<view class="floor-item u-card--shadow" v-for="(item, i) in floorList" :key="i">
				<!-- 楼层标题图 -->
				<view class="floor-header">
					<image :src="item.floor_title.image_src" class="floor-title-img" mode="widthFix"></image>
				</view>
				<!-- 楼层内容：采用左一右四布局 -->
				<view class="floor-img-box">
					<!-- 左侧大图 -->
					<navigator class="left-img-box u-pressable" :url="item.product_list[0].url">
						<image class="u-img-rounded floor-img" :src="item.product_list[0].image_src" mode="aspectFill"></image>
					</navigator>
					<!-- 右侧四个小图 -->
					<view class="right-img-box">
						<navigator class="right-img-item u-pressable" v-for="(item2, i2) in item.product_list.slice(1)" :key="i2" :url="item2.url">
							<image class="u-img-rounded floor-img" :src="item2.image_src" mode="aspectFill"></image>
						</navigator>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部提示 -->
		<view class="load-more">
			<view class="line"></view>
			<text class="text">已经到底啦</text>
			<view class="line"></view>
		</view>
	</view>
</template>

<script>
	// 导入购物车徽标混入
	import badgeMix from '@/mixins/tabbar-badge.js'
	
	export default {
		// 混入设置购物车徽标的逻辑
		mixins: [badgeMix],
		
		data() {
			return {
				swiperList: [],
				navList: [],
				floorList: [],
			}
		},
		
		/**
		 * 页面加载生命周期
		 */
		onLoad() {
			// 初始化请求首页各项数据
			this.getSwiperList()
			this.getNavList()
			this.getFloorList()
		},
		
		methods: {
			/**
			 * 获取轮播图数据
			 * 请求接口获取首页轮播图展示所需数据
			 */
			async getSwiperList() {
				const { data: res } = await uni.$http.get('/api/public/v1/home/swiperdata')
				if (res.meta.status !== 200) return uni.$showMsg()
				this.swiperList = res.message
			},
			
			/**
			 * 获取分类导航数据
			 * 请求接口获取首页分类导航按钮数据
			 */
			async getNavList() {
				const { data: res } = await uni.$http.get('/api/public/v1/home/catitems')
				if (res.meta.status !== 200) return uni.$showMsg()
				this.navList = res.message
			},
			
			/**
			 * 分类导航项点击事件处理
			 * @param {Object} item 点击的导航项数据对象
			 */
			navClickHandler(item) {
				// 目前逻辑统一跳转到分类 Tab 页面
				if (item.name === '分类') {
					uni.switchTab({
						url: '/pages/cate/cate'
					})
				}
			},
			
			/**
			 * 获取并处理楼层数据
			 * 1. 请求楼层原始数据
			 * 2. 对 navigator_url 进行清洗，转换为项目可用的 url 格式
			 * 3. 过滤特定无效数据
			 */
			async getFloorList() {
				const { data: res } = await uni.$http.get('/api/public/v1/home/floordata')
				if (res.meta.status !== 200) return uni.$showMsg()
				
				// 预处理 URL：将后端返回的 navigator_url 转换为项目内可用的 url
				res.message.forEach(floor => {
					floor.product_list.forEach(prod => {
						// 拼接出商品列表页面的跳转路径
						prod.url = '/subpkg/goods_list/goods_list?' + prod.navigator_url.split('?')[1]
					})
				})
				
				// 数据清洗：过滤无效楼层并排除特定演示楼层
				this.floorList = res.message.filter(floor => 
					floor.product_list.length > 0 && floor.floor_title.name !== '冲锋衣'
				)
			},
			
			/**
			 * 跳转至搜索页面
			 */
			gotoSearch() {
				uni.navigateTo({
					url: '/subpkg/search/search'
				})
			}
		},
	}
</script>

<style lang="scss">
	/* 页面整体背景 */
	.u-page {
		background-color: $color-bg-base;
	}

	/* 搜索栏：始终固定在页面顶部 */
	.search-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: $z-sticky;
		background: $color-primary-600;
		padding: 8rpx 16rpx;
	}

	.search-spacer {
		height: 52rpx;
	}

	/* 轮播图样式控制 */
	swiper {
		height: 330rpx;
		.swiper-item,
		image {
			width: 100%;
			height: 100%;
		}
	}
	
	/* 分类导航网格布局样式 */
	.nav-list {
		margin: $space-2;
		padding: $space-3 $space-2;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: $space-2;

		.nav-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: $space-1;
		}

		.nav-icon {
			width: 108rpx;
			height: 108rpx;
			border-radius: 999rpx;
			background: rgba(255, 255, 255, 0.92);
			border: 1px solid $color-border-1;
			box-shadow: 0 10rpx 24rpx rgba(31, 35, 41, 0.08);
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.nav-img {
			width: 72rpx;
			height: 72rpx;
		}

		.nav-text {
			font-size: $font-sm;
			color: $color-text-700;
		}
	}

	/* 业务分区标题装饰样式 */
	.section-title {
		margin: $space-2;
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		padding: 0 $space-1;

		.section-title__main {
			font-size: $font-lg;
			font-weight: 800;
			color: $color-text-900;
			letter-spacing: 1rpx;
			position: relative;
			padding-left: $space-2;

			&::before {
				content: '';
				position: absolute;
				left: 0;
				top: 50%;
				transform: translateY(-50%);
				width: 6rpx;
				height: 28rpx;
				background: $color-primary;
				border-radius: $radius-pill;
			}
		}

		.section-title__sub {
			font-size: $font-sm;
			color: $color-text-300;
		}
	}
	
	/* 楼层商品展示样式 */
	.floor-list {
		display: flex;
		flex-direction: column;
		gap: $space-3;
		padding: 0 $space-2 $space-4;
	}

	.floor-item {
		overflow: hidden;
		padding: $space-4;
		background: #fff;
		border-radius: $radius-lg;
		margin-bottom: $space-1;
	}

	.floor-header {
		display: flex;
		padding: $space-2 0;

		.floor-title-img {
			width: 100%;
			display: block;
		}
	}
	
	/* 楼层图片左一右四比例控制 */
	.floor-img-box {
		display: flex;
		gap: 10rpx;
		height: 440rpx;
		
		.left-img-box {
			flex: 2;
			height: 100%;
			
			.floor-img {
				width: 100%;
				height: 100%;
				display: block;
				box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
			}
		}

		.right-img-box {
			flex: 3;
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			align-content: space-between;
			height: 100%;
			
			.right-img-item {
				width: 48.5%; 
				height: 48.5%;
				
				.floor-img {
					width: 100%;
					height: 100%;
					display: block;
					box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.05);
				}
			}
		}
	}

	/* 图片交互动效 */
	.floor-img {
		display: block;
		transition: transform 0.2s ease, box-shadow 0.2s ease;

		&:active {
			transform: translateY(-2rpx);
			box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
		}
	}

	/* 页面底部加载完成提示 */
	.load-more {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: $space-7 0 $space-6;
		gap: $space-3;

		.line {
			width: 60rpx;
			height: 1px;
			background-color: $color-border-1;
		}

		.text {
			font-size: $font-xs;
			color: $color-text-300;
			letter-spacing: 2rpx;
			text-transform: uppercase;
		}
	}
</style>
