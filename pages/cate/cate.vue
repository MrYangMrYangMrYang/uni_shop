/** * 分类页面 * 实现左侧一级分类联动右侧二三级分类的布局展示 */
<template>
	<view class="u-page u-page--page">
		<!-- 搜索区域：始终固定在顶部 -->
		<view class="search-bar">
			<my-search @click="gotoSearch"></my-search>
		</view>
		<view class="search-spacer"></view>

		<!-- 网络异常兜底：接口失败时展示 -->
		<u-network-error
			v-if="pageError"
			:text="errorMessage"
			:sub-text="isPageNetworkError ? '请检查网络后重试' : '请下拉刷新或点击重试'"
			@retry="retry"
		/>

		<!-- 分类骨架屏 -->
		<view v-else-if="isLoading" class="skeleton-cate">
			<view class="skeleton-cate-left">
				<view class="skeleton-cate-item" v-for="i in 8" :key="i"></view>
			</view>
			<view class="skeleton-cate-right">
				<u-skeleton mode="card" :rows="6" />
			</view>
		</view>

		<!-- 分类主体滚动区域 -->
		<view class="scroll-view-container" v-else>
			<!-- 左侧一级分类滚动视图 -->
			<scroll-view class="left-scroll-view" scroll-y :style="{ height: wh + 'px' }">
				<block v-for="(item, i) in cateList" :key="i">
					<view :class="['left-scroll-view-item', i === active ? 'active' : '']" @click="activeChanged(i)">
						{{ item.cat_name }}
					</view>
				</block>
			</scroll-view>

			<!-- 右侧二三级分类滚动视图 -->
			<scroll-view class="right-scroll-view" scroll-y :scroll-top="scrollTop" :style="{ height: wh + 'px' }">
				<view class="cate-lv2" v-for="(item2, i2) in cateLevel2" :key="i2">
					<view class="cate-lv2-title">{{ item2.cat_name }}</view>

					<!-- 三级分类网格列表 -->
					<view class="cate-lv3-list">
						<view class="cate-lv3-item" v-for="(item3, i3) in item2.children" :key="i3" @click="gotoGoodsList(item3)">
							<image :src="item3.cat_icon"></image>
							<text>{{ item3.cat_name }}</text>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
import badgeMix from '@/mixins/tabbar-badge.js';
import errorBoundary from '@/mixins/error-boundary.js';
import USkeleton from '@/components/u-skeleton/u-skeleton.vue';
import UNetworkError from '@/components/u-network-error/u-network-error.vue';
import { getCategories } from '@/api/goods.js';
import env from '@/config/env.js';

export default {
	components: {
		'u-skeleton': USkeleton,
		'u-network-error': UNetworkError
	},
	mixins: [badgeMix, errorBoundary],

	data() {
		return {
			isLoading: true,
			wh: 0,
			cateList: [],
			active: 0,
			cateLevel2: [],
			scrollTop: 0
		};
	},

	onLoad() {
		const sysInfo = uni.getSystemInfoSync();
		// 50px 为顶部搜索框高度，需扣除
		this.wh = sysInfo.windowHeight - 50;
		this.getCateList();
	},

	methods: {
		async getCateList() {
			const result = await this.withErrorBoundary(
				async () => {
					const { data: res } = await getCategories();
					if (res.meta.status !== 200) return uni.$showMsg();

					// 过滤掉特定的演示或无效分类
					this.cateList = res.message.filter(item => !['冲锋衣', '其他'].includes(item.cat_name));

					// 业务需求：交换”热门推荐”和”大家电”的显示顺序
					const index1 = this.cateList.findIndex(item => item.cat_name === '热门推荐');
					const index2 = this.cateList.findIndex(item => item.cat_name === '大家电');
					if (index1 !== -1 && index2 !== -1) {
						const temp = this.cateList[index1];
						this.cateList[index1] = this.cateList[index2];
						this.cateList[index2] = temp;
					}

					// 安全检查：防止 active 索引因数据变化越界
					if (this.active >= this.cateList.length) this.active = 0;

					this.cateLevel2 = this.cateList[this.active].children.filter(
						item => !['冲锋衣', '其他'].includes(item.cat_name)
					);
				},
				{ errorMessage: '分类数据加载失败' }
			);
			this.isLoading = false;
		},

		activeChanged(i) {
			this.active = i;
			this.cateLevel2 = this.cateList[i].children.filter(item => !['冲锋衣', '其他'].includes(item.cat_name));

			// 重置右侧滚动条位置：scroll-view 仅在 scrollTop 变化时触发滚动，
			// 通过 0 与 0.1 微调确保每次切换都能触发重置
			this.scrollTop = this.scrollTop === 0 ? 0.1 : 0;
		},

		gotoGoodsList(item3) {
			uni.navigateTo({
				url: '/subpkg/goods_list/goods_list?cid=' + item3.cat_id
			});
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

/* 页面分类主布局容器 */
.scroll-view-container {
	display: flex;
	padding: $space-2;
	gap: $space-2;

	/* 左侧一级分类列表样式 */
	.left-scroll-view {
		width: 200rpx;
		border-radius: $radius-lg;
		overflow: hidden;
		background: $color-bg-card;
		box-shadow: $shadow-sm;

		.left-scroll-view-item {
			background-color: transparent;
			line-height: 96rpx;
			text-align: center;
			font-size: $font-sm;
			color: $color-text-500;

			&.active {
				background-color: transparent;
				position: relative;
				color: $color-primary-600;
				font-weight: 700;

				/* 激活项侧边指示条装饰 */
				&::before {
					content: ' ';
					display: block;
					width: 6rpx;
					height: 32rpx;
					background-color: $color-primary-600;
					position: absolute;
					top: 50%;
					left: 12rpx;
					transform: translateY(-50%);
					border-radius: $radius-pill;
				}
			}
		}
	}
}

/* 二级分类分组标题样式 */
.cate-lv2-title {
	font-size: $font-md;
	font-weight: 800;
	text-align: center;
	padding: $space-4 $space-2;
	color: $color-text-900;
	display: flex;
	align-items: center;
	justify-content: center;
	letter-spacing: 2rpx;

	/* 标题两侧渐变线装饰 */
	&::before,
	&::after {
		content: '';
		width: 40rpx;
		height: 4rpx;
		background: linear-gradient(to right, transparent, $color-primary-100);
		border-radius: $radius-pill;
		margin: 0 $space-2;
	}

	&::after {
		background: linear-gradient(to left, transparent, $color-primary-100);
	}
}

/* 三级分类网格布局样式 */
.cate-lv3-list {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: $space-2;
	padding: 0 $space-2 $space-2;

	.cate-lv3-item {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		border-radius: $radius-lg;
		background: $color-bg-card;
		box-shadow: $shadow-sm;
		padding: $space-2 $space-1;
		transition:
			transform 120ms ease,
			opacity 120ms ease;

		/* 点击缩放动效 */
		&:active {
			transform: scale(0.98);
			opacity: 0.92;
		}

		image {
			width: 96rpx;
			height: 96rpx;
			border-radius: $radius-md;
		}

		text {
			font-size: $font-xs;
			color: $color-text-700;
			margin-top: $space-1;
			max-width: 100%;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
}

/* 分类页骨架屏样式 */
.skeleton-cate {
	display: flex;
	gap: $space-2;
	padding: $space-2;

	.skeleton-cate-left {
		width: 200rpx;
		display: flex;
		flex-direction: column;
		gap: $space-2;

		.skeleton-cate-item {
			height: 96rpx;
			background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
			background-size: 200% 100%;
			animation: skeleton-shimmer 1.4s ease infinite;
			border-radius: $radius-md;
		}
	}

	.skeleton-cate-right {
		flex: 1;
	}
}

@keyframes skeleton-shimmer {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}
</style>
