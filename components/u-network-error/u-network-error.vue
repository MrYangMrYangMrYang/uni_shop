<!--
  通用网络异常组件
  用于接口失败时的兜底展示，提供"重试"按钮
  配合 @retry 事件使用
-->
<template>
	<view class="u-network-error">
		<view class="u-network-error__icon">
			<uni-icons type="wifi" size="80" color="#c0c4cc"></uni-icons>
		</view>
		<text class="u-network-error__text">{{ text }}</text>
		<text class="u-network-error__sub">{{ subText }}</text>
		<view class="u-network-error__btn u-pressable" @click="$emit('retry')">
			<uni-icons type="refresh" size="14" color="#fff"></uni-icons>
			<text>重试</text>
		</view>
	</view>
</template>

<script>
export default {
	name: 'u-network-error',
	props: {
		text: {
			type: String,
			default: '网络连接失败'
		},
		subText: {
			type: String,
			default: '请检查网络后重试'
		}
	}
};
</script>

<style lang="scss">
.u-network-error {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 200rpx 0;

	&__icon {
		margin-bottom: $space-4;
	}

	&__text {
		font-size: $font-md;
		color: $color-text-500;
		margin-bottom: $space-2;
	}

	&__sub {
		font-size: $font-sm;
		color: $color-text-muted;
		margin-bottom: $space-5;
	}

	&__btn {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: $space-2 $space-5;
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
