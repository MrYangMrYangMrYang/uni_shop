<!--
  通用骨架屏组件
  用于列表/卡片首屏加载占位，提升感知性能
  支持列表模式和卡片网格模式
-->
<template>
	<view class="u-skeleton">
		<!-- 列表模式 -->
		<template v-if="mode === 'list'">
			<view class="u-skeleton__item" v-for="i in rows" :key="i">
				<view class="u-skeleton__avatar"></view>
				<view class="u-skeleton__content">
					<view class="u-skeleton__line u-skeleton__line--w100"></view>
					<view class="u-skeleton__line u-skeleton__line--w80"></view>
					<view class="u-skeleton__line u-skeleton__line--w60"></view>
				</view>
			</view>
		</template>

		<!-- 卡片网格模式 -->
		<template v-else-if="mode === 'card'">
			<view class="u-skeleton__grid">
				<view class="u-skeleton__card" v-for="i in rows" :key="i">
					<view class="u-skeleton__card-img"></view>
					<view class="u-skeleton__line u-skeleton__line--w100"></view>
					<view class="u-skeleton__line u-skeleton__line--w60"></view>
				</view>
			</view>
		</template>

		<!-- 详情模式 -->
		<template v-else-if="mode === 'detail'">
			<view class="u-skeleton__detail">
				<view class="u-skeleton__banner"></view>
				<view class="u-skeleton__line u-skeleton__line--w100"></view>
				<view class="u-skeleton__line u-skeleton__line--w100"></view>
				<view class="u-skeleton__line u-skeleton__line--w80"></view>
				<view class="u-skeleton__line u-skeleton__line--w60"></view>
			</view>
		</template>
	</view>
</template>

<script>
export default {
	name: 'u-skeleton',
	props: {
		// 展示模式：list 列表 / card 卡片网格 / detail 详情
		mode: {
			type: String,
			default: 'list'
		},
		// 占位行数（list/card 模式生效）
		rows: {
			type: Number,
			default: 5
		},
		// 是否激活动画
		animate: {
			type: Boolean,
			default: true
		}
	}
};
</script>

<style lang="scss">
// 骨架屏闪烁动画
@mixin skeleton-shimmer {
	background: linear-gradient(90deg, $color-bg-soft 25%, #eaeaea 50%, $color-bg-soft 75%);
	background-size: 200% 100%;
	animation: skeleton-shimmer 1.4s ease infinite;
}

@keyframes skeleton-shimmer {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}

.u-skeleton {
	width: 100%;

	&__item {
		display: flex;
		align-items: center;
		padding: $space-3;
		background-color: $color-bg;
		border-radius: $radius-lg;
		margin-bottom: $space-2;
	}

	&__avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: $radius-md;
		margin-right: $space-3;
		flex-shrink: 0;
		@include skeleton-shimmer;
	}

	&__content {
		flex: 1;
		min-width: 0;
	}

	&__line {
		height: 28rpx;
		border-radius: $radius-pill;
		margin-bottom: $space-2;
		@include skeleton-shimmer;

		&--w100 {
			width: 100%;
		}
		&--w80 {
			width: 80%;
		}
		&--w60 {
			width: 60%;
		}
		&--w40 {
			width: 40%;
		}
	}

	&__grid {
		display: flex;
		flex-wrap: wrap;
		gap: $space-2;
	}

	&__card {
		width: calc(50% - 8rpx);
		background-color: $color-bg;
		border-radius: $radius-lg;
		overflow: hidden;
		padding-bottom: $space-2;
	}

	&__card-img {
		width: 100%;
		height: 240rpx;
		@include skeleton-shimmer;
	}

	&__detail {
		padding: $space-3;
	}

	&__banner {
		width: 100%;
		height: 360rpx;
		border-radius: $radius-lg;
		margin-bottom: $space-3;
		@include skeleton-shimmer;
	}
}
</style>
