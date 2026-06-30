<!--
  通用空状态组件
  用于列表无数据、无订单、无地址等场景，统一空状态 UI
  支持自定义图标、文案、操作按钮
-->
<template>
	<view class="u-empty" :class="['u-empty--' + mode]">
		<image v-if="imgSrc" :src="imgSrc" class="u-empty__img" mode="aspectFit"></image>
		<view v-else class="u-empty__icon">
			<uni-icons :type="displayIcon" size="80" color="#c0c4cc"></uni-icons>
		</view>
		<text class="u-empty__text">{{ displayText }}</text>
		<view v-if="buttonText" class="u-empty__btn u-pressable" @click="$emit('action')">
			{{ buttonText }}
		</view>
	</view>
</template>

<script>
export default {
	name: 'u-empty',
	props: {
		// 展示模式：default 默认空状态 / search 搜索无结果 / order 无订单 / network 网络异常
		mode: {
			type: String,
			default: 'default'
		},
		// 自定义文案（覆盖模式默认文案）
		text: {
			type: String,
			default: ''
		},
		// 自定义图标（uni-icons 类型名）
		icon: {
			type: String,
			default: 'info'
		},
		// 自定义图片地址（优先于图标）
		imgSrc: {
			type: String,
			default: ''
		},
		// 操作按钮文案（为空则不显示按钮）
		buttonText: {
			type: String,
			default: ''
		}
	},
	computed: {
		defaultText() {
			const map = {
				default: '暂无数据',
				search: '没有找到相关商品',
				order: '您还没有相关的订单',
				address: '您还没有收货地址，快去添加吧',
				network: '网络异常，请稍后重试'
			};
			return map[this.mode] || map.default;
		},
		displayText() {
			return this.text || this.defaultText;
		},
		// 根据 mode 自动选择匹配的图标
		displayIcon() {
			// 若用户传了自定义 icon 或 imgSrc，优先使用
			if (this.icon !== 'info' || this.imgSrc) return this.icon;
			const iconMap = {
				order: 'paperplane',
				address: 'location',
				search: 'search',
				network: 'wifi',
				default: 'info'
			};
			return iconMap[this.mode] || iconMap.default;
		}
	}
};
</script>

<style lang="scss">
.u-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 200rpx 0;
	color: $color-text-muted;
	font-size: $font-md;

	&__img {
		width: 320rpx;
		height: 320rpx;
		margin-bottom: $space-3;
	}

	&__icon {
		margin-bottom: $space-3;
	}

	&__text {
		color: $color-text-muted;
		font-size: $font-md;
		margin-bottom: $space-5;
	}

	&__btn {
		padding: $space-2 $space-6;
		background-color: $color-primary-600;
		color: #fff;
		font-size: $font-sm;
		border-radius: $radius-pill;
		box-shadow: 0 8rpx 20rpx rgba(192, 0, 0, 0.2);

		&:active {
			transform: scale(0.96);
			opacity: 0.9;
		}
	}
}
</style>
