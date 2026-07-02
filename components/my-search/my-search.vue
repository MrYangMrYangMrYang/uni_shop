<!--
  模拟搜索框组件
  非真实输入框，点击后跳转到搜索页面的"占位符"
  支持自定义背景颜色和圆角尺寸
-->
<template>
	<view class="my-search-container" @click="searchBoxHandler" :style="{ 'background-color': bgcolor }">
		<view class="my-search-box" :style="{ 'border-radius': radius + 'px' }">
			<uni-icons type="search" size="18" :color="placeholderColor"></uni-icons>
			<text class="placeholder">搜索</text>
		</view>
	</view>
</template>

<script>
export default {
	name: 'my-search',
	props: {
		bgcolor: {
			type: String,
			default: '#C00000' // $color-primary
		},
		radius: {
			type: Number,
			default: 18
		}
	},
	data() {
		return {
			placeholderColor: '#999999' // $color-text-300
		};
	},
	methods: {
		searchBoxHandler() {
			this.$emit('click');
		}
	}
};
</script>

<style lang="scss">
.my-search-container {
	height: 36px;
	display: flex;
	align-items: center;

	.my-search-box {
		height: 28px;
		background-color: $color-white;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;

		.placeholder {
			font-size: 13px;
			margin-left: 4rpx;
			color: $color-text-300;
		}
	}
}
</style>
