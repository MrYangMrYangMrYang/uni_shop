/** * 首页 * 展示轮播图、分类导航、楼层商品等核心内容 */
<template>
	<view class="u-page u-page--page">
		<!-- 搜索区域：始终固定在顶部 -->
		<view class="search-bar">
			<my-search @click="gotoSearch"></my-search>
		</view>
		<!-- 永久占位，防止内容上移 -->
		<view class="search-spacer"></view>

		<!-- 轮播图骨架屏 -->
		<view v-if="isLoading" class="skeleton-banner u-card--shadow">
			<u-skeleton mode="detail" :rows="1" />
		</view>
		<!-- 轮播图区域 -->
		<swiper
			v-else
			:indicator-dots="true"
			:autoplay="true"
			:interval="3000"
			:duration="1000"
			:circular="true"
			indicator-active-color="#C00000"
		>
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

		<!-- 分类导航骨架屏 -->
		<view v-if="isLoading" class="skeleton-nav">
			<u-skeleton mode="card" :rows="4" />
		</view>
		<!-- 分类导航区域 -->
		<view class="nav-list u-card--shadow" v-else>
			<view class="nav-item u-pressable" v-for="(item, i) in navList" :key="i" @click="navClickHandler(item)">
				<view class="nav-icon">
					<image :src="item.image_src" class="nav-img"></image>
				</view>
				<text class="nav-text">{{ item.name }}</text>
			</view>
		</view>

		<!-- 楼层骨架屏 -->
		<view v-if="isLoading" class="skeleton-floor">
			<u-skeleton mode="card" :rows="3" />
		</view>
		<!-- 楼层展示区域 -->
		<view class="floor-list" v-else>
			<view class="floor-item u-card--shadow" v-for="(item, i) in floorList" :key="i">
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
						<navigator
							class="right-img-item u-pressable"
							v-for="(item2, i2) in item.product_list.slice(1)"
							:key="i2"
							:url="item2.url"
						>
							<image class="u-img-rounded floor-img" :src="item2.image_src" mode="aspectFill"></image>
						</navigator>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部提示 -->
		<view class="load-more" v-if="!isLoading">
			<view class="line"></view>
			<text class="text">已经到底啦</text>
			<view class="line"></view>
		</view>
	</view>
</template>

<script>
import badgeMix from '@/mixins/tabbar-badge.js';
import USkeleton from '@/components/u-skeleton/u-skeleton.vue';
import { getSwiperList, getNavList, getFloorList } from '@/api/home.js';
import env from '@/config/env.js';

export default {
	components: {
		'u-skeleton': USkeleton
	},
	mixins: [badgeMix],

	data() {
		return {
			isLoading: true,
			swiperList: [],
			navList: [],
			floorList: []
		};
	},

	onLoad() {
		this.loadHomeData();
	},

	methods: {
		// P2-26: 三个独立接口改为 Promise.all 并发，避免串行放大首屏时间
		async loadHomeData() {
			try {
				await Promise.all([this.getSwiperList(), this.getNavList(), this.getFloorList()]);
			} catch (e) {
				if (env.enableLog) console.error('[home] 首页数据加载失败:', e);
			} finally {
				this.isLoading = false;
			}
		},

		async getSwiperList() {
			const { data: res } = await getSwiperList();
			if (res.meta.status !== 200) return uni.$showMsg();
			this.swiperList = res.message;
		},

		async getNavList() {
			const { data: res } = await getNavList();
			if (res.meta.status !== 200) return uni.$showMsg();
			this.navList = res.message;
		},

		navClickHandler(item) {
			if (item.name === '分类') {
				uni.switchTab({
					url: '/pages/cate/cate'
				});
			}
		},

		async getFloorList() {
			const { data: res } = await getFloorList();
			if (res.meta.status !== 200) return uni.$showMsg();

			res.message.forEach(floor => {
				floor.product_list.forEach(prod => {
					prod.url = '/subpkg/goods_list/goods_list?' + prod.navigator_url.split('?')[1];
				});
			});

			this.floorList = res.message.filter(
				floor => floor.product_list.length > 0 && floor.floor_title.name !== '冲锋衣'
			);
		},

		gotoSearch() {
			uni.navigateTo({
				url: '/subpkg/search/search'
			});
		}
	}
};
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
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
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
				box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
			}
		}
	}
}

/* 图片交互动效 */
.floor-img {
	display: block;
	transition:
		transform 0.2s ease,
		box-shadow 0.2s ease;

	&:active {
		transform: translateY(-2rpx);
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	}
}

/* 骨架屏容器样式 */
.skeleton-banner {
	height: 330rpx;
	margin: 0 $space-2;
	overflow: hidden;
}

.skeleton-nav {
	margin: $space-2;
}

.skeleton-floor {
	margin: 0 $space-2;
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
