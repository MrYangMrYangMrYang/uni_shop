<!--
  通用图片组件
  在原生 image 基础上补齐：加载失败兜底、加载中占位、lazy-load 默认开启
  用法：<u-image :src="url" mode="aspectFill" />
-->
<template>
	<view class="u-image" :style="{ width: width, height: height }">
		<!-- 加载中占位 -->
		<view v-if="status === 'loading'" class="u-image__placeholder">
			<view class="u-image__shimmer"></view>
		</view>

		<!-- 加载失败兜底 -->
		<view v-if="status === 'error'" class="u-image__error" @click="reload">
			<uni-icons :type="errorIcon" size="32" color="#c0c4cc"></uni-icons>
			<text class="u-image__error-text">{{ errorText }}</text>
		</view>

		<!-- 主图 -->
		<image
			v-if="status !== 'error'"
			class="u-image__inner"
			:src="currentSrc"
			:mode="mode"
			:lazy-load="lazyLoad"
			@error="onImageError"
			@load="onImageLoaded"
			:style="{ opacity: status === 'loaded' ? 1 : 0 }"
		></image>
	</view>
</template>

<script>
export default {
	name: 'u-image',
	props: {
		// 图片地址
		src: {
			type: String,
			default: ''
		},
		// 图片裁剪模式（与原生 image 的 mode 一致）
		mode: {
			type: String,
			default: 'aspectFill'
		},
		// 宽度（支持 rpx/px/百分比）
		width: {
			type: String,
			default: '100%'
		},
		// 高度
		height: {
			type: String,
			default: '100%'
		},
		// 是否开启懒加载
		lazyLoad: {
			type: Boolean,
			default: true
		},
		// 自定义兜底图地址（为空则使用 errorIcon）
		fallbackSrc: {
			type: String,
			default: ''
		},
		// 错误图标（uni-icons 类型）
		errorIcon: {
			type: String,
			default: 'image'
		},
		// 错误文案
		errorText: {
			type: String,
			default: '加载失败'
		}
	},
	data() {
		return {
			// 加载状态：loaded（默认可见）/ error（加载失败）/ loading（重试中）
			// 注意：小程序中 @load 事件不可靠，默认应为 loaded 而非 loading
			status: 'loaded',
			currentSrc: this.src,
			retryCount: 0
		};
	},
	watch: {
		src(newVal) {
			if (newVal !== this.currentSrc) {
				this.currentSrc = newVal;
				this.status = 'loaded';
				this.retryCount = 0;
			}
		}
	},
	methods: {
		onImageError() {
			if (this.retryCount === 0 && this.fallbackSrc && this.currentSrc !== this.fallbackSrc) {
				this.retryCount++;
				this.currentSrc = this.fallbackSrc;
			} else {
				this.status = 'error';
			}
		},
		onImageLoaded() {
			// 小程序中 @load 事件可能不触发，此回调仅作兼容保留
			this.status = 'loaded';
		},
		// 点击失败区域重新加载原图
		reload() {
			this.retryCount = 0;
			this.currentSrc = this.src;
			this.status = 'loading';
		}
	}
};
</script>

<style lang="scss">
.u-image {
	position: relative;
	display: inline-block;
	overflow: hidden;
	background-color: $color-bg-soft;

	&__inner {
		width: 100%;
		height: 100%;
		display: block;
		transition: opacity 0.3s ease;
	}

	&__placeholder {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: $color-bg-soft;
	}

	&__shimmer {
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, $color-bg-soft 25%, #eaeaea 50%, $color-bg-soft 75%);
		background-size: 200% 100%;
		animation: u-image-shimmer 1.4s ease infinite;
	}

	&__error {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: $color-bg-soft;
		gap: $space-1;

		&-text {
			font-size: $font-xs;
			color: $color-text-muted;
		}
	}
}

@keyframes u-image-shimmer {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}
</style>
