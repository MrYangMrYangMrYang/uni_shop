<template>
	<view class="u-page u-page--page">
		<!-- 使用自定义的搜索组件 -->
		<view class="search-box u-sticky-top u-header-brand u-header-elevated u-brand-header">
			<my-search @click="gotoSearch"></my-search>
		</view>
		
		<!-- 轮播图区域 -->
		<swiper :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000" :circular="true" indicator-active-color="#C00000">
			<!-- 循环渲染轮播图的 item 项 -->
			<swiper-item v-for="(item, i) in swiperList" :key="i">
				<navigator class="swiper-item u-pressable" url="/pages/cate/cate" open-type="switchTab">
					<image :src="item.image_src"></image>
				</navigator>
			</swiper-item>
		</swiper>

		<!-- 轻量分区标题（提升层级，不加业务） -->
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
		
		<!-- 楼层区域 -->
		<view class="floor-list">
			<view class="floor-item u-card--shadow" v-for="(item, i) in floorList" :key="i">
				<!-- 楼层标题 -->
				<view class="floor-header">
					<image :src="item.floor_title.image_src" class="floor-title-img" mode="widthFix"></image>
				</view>
				<!-- 楼层内容 -->
				<view class="floor-img-box">
					<!-- 左侧大图 -->
					<navigator class="left-img-box u-pressable" :url="item.product_list[0].url">
						<image class="u-img-rounded floor-img" :src="item.product_list[0].image_src" mode="aspectFill"></image>
					</navigator>
					<!-- 右侧小图 -->
					<view class="right-img-box">
						<navigator class="right-img-item u-pressable" v-for="(item2, i2) in item.product_list.slice(1)" :key="i2" :url="item2.url">
							<image class="u-img-rounded floor-img" :src="item2.image_src" mode="aspectFill"></image>
						</navigator>
					</view>
				</view>
			</view>
		</view>

		<!-- 到底了提示 -->
		<view class="load-more">
			<view class="line"></view>
			<text class="text">已经到底啦</text>
			<view class="line"></view>
		</view>
	</view>
</template>

<script>
	// 导入自己封装的 mixin 模块
	import badgeMix from '@/mixins/tabbar-badge.js'
	
	export default {
		// 将 badgeMix 混入到当前的页面中进行使用
		mixins: [badgeMix],
		
		data() {
			return {
				// 轮播图的数据列表，默认为空数组
				swiperList: [],
				// 分类导航的数据列表
				navList: [],
				// 楼层的数据列表
				floorList: [],
			}
		},
		onLoad() {
			// 在小程序页面刚加载的时候，调用获取数据的方法
			this.getSwiperList()
			this.getNavList()
			this.getFloorList()
		},
		methods: {
			// 获取轮播图数据的方法
			async getSwiperList() {
				// 发起请求
				const { data: res } = await uni.$http.get('/api/public/v1/home/swiperdata')
				// 请求失败
				if (res.meta.status !== 200) return uni.$showMsg()
				// 请求成功，为 data 中的数据赋值
				this.swiperList = res.message
			},
			// 获取分类导航数据的方法
			async getNavList() {
				const { data: res } = await uni.$http.get('/api/public/v1/home/catitems')
				if (res.meta.status !== 200) return uni.$showMsg()
				this.navList = res.message
			},
			// nav-item 项被点击执行的事件处理函数
			navClickHandler(item) {
				// 统一跳转到分类页
				uni.switchTab({
					url: '/pages/cate/cate'
				})
			},
			// 定义获取楼层列表数据的方法
			async getFloorList() {
				const { data: res } = await uni.$http.get('/api/public/v1/home/floordata')
				if (res.meta.status !== 200) return uni.$showMsg()
				// 通过双层 forEach 循环，处理 URL 地址
				res.message.forEach(floor => {
					floor.product_list.forEach(prod => {
						prod.url = '/subpkg/goods_list/goods_list?' + prod.navigator_url.split('?')[1]
					})
				})
				// 过滤掉没有数据或标题为“冲锋衣”的楼层
				this.floorList = res.message.filter(floor => floor.product_list.length > 0 && floor.floor_title.name !== '冲锋衣')
			},
			gotoSearch() {
				uni.navigateTo({
					url: '/subpkg/search/search'
				})
			}
		},
	}
</script>

<style lang="scss">
	swiper {
		height: 330rpx;
		.swiper-item,
		image {
			width: 100%;
			height: 100%;
		}
	}
	
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
	
	.floor-title {
	    width: 100%;
	    height: 60rpx;
	  }

	.floor-list {
		display: flex;
		flex-direction: column;
		gap: $space-3;
		padding: 0 $space-2 $space-4;
	}

	.floor-item {
		overflow: hidden;
		padding: $space-4; // 增加内边距
		background: #fff;
		border-radius: $radius-lg;
		margin-bottom: $space-1; // 增加卡片间隙
	}

	.floor-header {
		display: flex;
		padding: $space-2 0;

		.floor-title-img {
			width: 100%; // 让标题占满宽度，从而变大
			display: block;
		}
	}
	
	.floor-img-box {
		display: flex;
		gap: 10rpx;
		height: 440rpx; // 设定一个标准高度，确保左右对齐
		
		.left-img-box {
			flex: 2; // 占 2/5 宽度
			height: 100%;
			
			.floor-img {
				width: 100%;
				height: 100%;
				display: block;
				box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
			}
		}

		.right-img-box {
			flex: 3; // 占 3/5 宽度
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			align-content: space-between;
			height: 100%;
			
			.right-img-item {
				width: 48.5%; 
				height: 48.5%; // 确保两行分布
				
				.floor-img {
					width: 100%;
					height: 100%;
					display: block;
					box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.05);
				}
			}
		}
	}

	.floor-img {
		display: block;
		transition: transform 0.2s ease, box-shadow 0.2s ease;

		&:active {
			transform: translateY(-2rpx);
			box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
		}
	}

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
