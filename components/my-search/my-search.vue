<!-- 
  模拟搜索框组件
  并非真实的输入框，而是一个点击后跳转到搜索页面的“占位符”
  支持自定义背景颜色和圆角尺寸
-->
<template>
	<view class="my-search-container" @click="searchBoxHandler" :style="{'background-color': bgcolor}">
		<!-- 模拟搜索框主体 -->
		<view class="my-search-box" :style="{'border-radius': radius + 'px'}">
			<uni-icons type="search" size="18"></uni-icons>
			<text class="placeholder">搜索</text>
		</view>
	</view>
</template>

<script>
	/**
	 * 模拟搜索框组件
	 * 并非真实的 input 输入框，而是一个点击后触发跳转行为的“占位符”组件
	 * 常用于首页顶部，支持自定义背景色和圆角
	 */
	export default {
		name:"my-search",
		// 定义组件的可配置属性
		props: {
			// 搜索组件外层容器的背景颜色
			bgcolor: {
				type: String,
				default: '#C00000'
			},
			// 搜索框的圆角尺寸 (单位：px)
			radius: {
				type: Number,
				default: 18
			}
		},
		data() {
			return {};
		},
		methods: {
			/**
			 * 点击搜索框的回调逻辑
			 * 向上级组件分发 click 事件，由外部逻辑决定跳转行为
			 */
			searchBoxHandler() {
				this.$emit('click')
			}
		}
	}
</script>

<style lang="scss">
	 /* 搜索组件外层容器 */
	 .my-search-container {
	    height: 50px;
	    display: flex;
	    align-items: center;
	    padding: 0 10px;
	
	    /* 内部白色搜索框区域 */
	    .my-search-box {
	      height: 36px;
	      background-color: #FFFFFF;
	      width: 100%;
	      display: flex;
	      justify-content: center;
	      align-items: center;
	
	      /* 占位文本样式 */
	      .placeholder {
	        font-size: 15px;
	        margin-left: 5px;
	      }
	    }
	  }
</style>