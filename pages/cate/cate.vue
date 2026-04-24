<template>
	<view class="u-page u-page--page">
		 <!-- 使用自定义的搜索组件 -->
		<!-- <my-search :bgcolor="'pink'" :radius="12"></my-search> -->
		<view class="search-wrap u-header-brand u-header-elevated u-sticky-top u-brand-header">
			<my-search @click="gotoSearch"></my-search>
		</view>
		
		<view class="scroll-view-container">
			<!-- 左侧的滚动视图区域 -->
			<scroll-view class="left-scroll-view" scroll-y :style="{height: wh + 'px'}">
				<block v-for="(item, i) in cateList" :key="i">
					<view :class="['left-scroll-view-item', i === active ? 'active' : '']" @click="activeChanged(i)">{{item.cat_name}}</view>
				</block>
			</scroll-view>
			<!-- 右侧的滚动视图区域 -->
			<scroll-view class="right-scroll-view" scroll-y :scroll-top="scrollTop" :style="{height: wh + 'px'}">
				<view class="cate-lv2" v-for="(item2, i2) in cateLevel2" :key="i2">
					<!-- 二级分类的标题 -->
					<view class="cate-lv2-title">{{item2.cat_name}}</view>
					<!-- 动态渲染三级分类的列表数据 -->
					<view class="cate-lv3-list">
						<!-- 三级分类 Item 项 -->
						<view class="cate-lv3-item" v-for="(item3, i3) in item2.children" :key="i3" @click="gotoGoodsList(item3)">
							<!-- 图片 -->
							<image :src="item3.cat_icon"></image>
							<!-- 文本 -->
							<text>{{item3.cat_name}}</text>
						</view>
					</view>
				</view>
			</scroll-view>
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
				// 窗口的可用高度
				wh: 0,
				// 分类数据列表
				cateList: [],
				// 当前选中项的索引，默认让第一项被选中
				active: 0,
				// 二级分类的列表
				cateLevel2: [],
				// 滚动条距离顶部的距离
				scrollTop: 0
			};
		},
		onLoad() {
			// 获取当前系统的信息
			const sysInfo = uni.getSystemInfoSync()
			// 为 wh 窗口可用高度动态赋值
			// 可用高度 = 屏幕高度 - navigationBar高度 - tabBar高度 - 自定义的search组件高度
			this.wh = sysInfo.windowHeight - 50
			
		    // 调用获取分类列表数据的方法
		    this.getCateList()
		},
		methods: {
			// 定义获取分类列表数据的方法
			async getCateList() {
				// 发起请求
				const { data: res } = await uni.$http.get('/api/public/v1/categories')
				// 判断是否获取失败
				if (res.meta.status !== 200) return uni.$showMsg()
				// 转存数据，过滤掉“冲锋衣”和“其他”
				this.cateList = res.message.filter(item => !['冲锋衣', '其他'].includes(item.cat_name))
				// 重新检查 active 索引是否超出范围
				if (this.active >= this.cateList.length) this.active = 0
				// 为二级分类赋值，并过滤掉“冲锋衣”和“其他”
				this.cateLevel2 = this.cateList[this.active].children.filter(item => !['冲锋衣', '其他'].includes(item.cat_name))
			},
			
			// 选中项改变的事件处理函数
			activeChanged(i) {
				// 更改激活项的值为选项下标
				this.active = i
				// 为二级分类列表重新赋值，并过滤掉“冲锋衣”和“其他”
				this.cateLevel2 = this.cateList[i].children.filter(item => !['冲锋衣', '其他'].includes(item.cat_name))
				// 为滚动距离动态赋值，使切换一级标题时滚动条可以回到顶部
				this.scrollTop = this.scrollTop === 0 ? 0.1 : 0
			},
			
			// 点击三级分类项跳转到商品列表页面
			gotoGoodsList(item3) {
				uni.navigateTo({
					url: '/subpkg/goods_list/goods_list?cid=' + item3.cat_id
				})
			},
			
			// 跳转到分包中的搜索页面
			gotoSearch() {
				uni.navigateTo({
					url: '/subpkg/search/search'
				})
			}
		}
	}
</script>

<style lang="scss">
	 .scroll-view-container {
	    display: flex;
		padding: $space-2;
		gap: $space-2;
	
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
			
	        // 激活项的样式
	        &.active {
	          background-color: transparent;
	          position: relative;
			  color: $color-primary-600;
			  font-weight: 700;
	          // 渲染激活项左侧的红色指示边线
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
		
		&::before, &::after {
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
		  transition: transform 120ms ease, opacity 120ms ease;

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
	        font-size: $font-sm;
			color: $color-text-700;
			margin-top: $space-1;
			max-width: 100%;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
	      }
	    }
	  }
</style>
