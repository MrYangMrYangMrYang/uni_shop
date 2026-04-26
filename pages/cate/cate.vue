/**
 * 分类页面
 * 实现左侧一级分类联动右侧二三级分类的布局展示
 */
<template>
	<view class="u-page u-page--page">
		<!-- 搜索组件容器：吸顶展示 -->
		<view class="search-wrap u-header-brand u-header-elevated u-sticky-top u-brand-header">
			<my-search @click="gotoSearch"></my-search>
		</view>
		
		<!-- 分类主体滚动区域 -->
		<view class="scroll-view-container">
			<!-- 左侧一级分类滚动视图 -->
			<scroll-view class="left-scroll-view" scroll-y :style="{height: wh + 'px'}">
				<block v-for="(item, i) in cateList" :key="i">
					<!-- 点击切换激活项：动态绑定 active 类名 -->
					<view :class="['left-scroll-view-item', i === active ? 'active' : '']" @click="activeChanged(i)">
						{{item.cat_name}}
					</view>
				</block>
			</scroll-view>

			<!-- 右侧二三级分类滚动视图 -->
			<scroll-view class="right-scroll-view" scroll-y :scroll-top="scrollTop" :style="{height: wh + 'px'}">
				<view class="cate-lv2" v-for="(item2, i2) in cateLevel2" :key="i2">
					<!-- 二级分类标题装饰 -->
					<view class="cate-lv2-title">{{item2.cat_name}}</view>
					
					<!-- 三级分类网格列表 -->
					<view class="cate-lv3-list">
						<view class="cate-lv3-item" v-for="(item3, i3) in item2.children" :key="i3" @click="gotoGoodsList(item3)">
							<!-- 分类图标：展示商品分类图片 -->
							<image :src="item3.cat_icon"></image>
							<!-- 分类名称：限制单行省略 -->
							<text>{{item3.cat_name}}</text>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	// 导入购物车徽标混入
	import badgeMix from '@/mixins/tabbar-badge.js'
	
	export default {
		// 混入设置购物车徽标的逻辑
		mixins: [badgeMix],
		
		data() {
			return {
				// 当前窗口可用高度 (px)：用于动态计算 scroll-view 高度
				wh: 0,
				// 所有分类的数据列表（完整树结构）
				cateList: [],
				// 当前激活的一级分类索引，默认为 0
				active: 0,
				// 当前展示的二级分类数据列表（基于 active 动态计算）
				cateLevel2: [],
				// 滚动条距离顶部的距离 (用于切换分类后重置右侧滚动位置)
				scrollTop: 0
			};
		},

		/**
		 * 页面加载生命周期
		 */
		onLoad() {
			// 1. 获取系统信息，计算滚动视图的可用高度
			const sysInfo = uni.getSystemInfoSync()
			// 50px 是顶部搜索框的高度（需要根据实际布局扣除）
			this.wh = sysInfo.windowHeight - 50
			
		    // 2. 初始化分类列表数据
		    this.getCateList()
		},

		methods: {
			/**
			 * 获取并处理分类列表数据
			 * 包含：请求接口、数据过滤、排序调整及初始化
			 */
			async getCateList() {
				const { data: res } = await uni.$http.get('/api/public/v1/categories')
				if (res.meta.status !== 200) return uni.$showMsg()
				
				// 1. 转存数据，并过滤掉特定的演示或无效分类
				this.cateList = res.message.filter(item => !['冲锋衣', '其他'].includes(item.cat_name))
				
				// 2. 业务需求调整：交换“热门推荐”和“大家电”的显示顺序
				const index1 = this.cateList.findIndex(item => item.cat_name === '热门推荐')
				const index2 = this.cateList.findIndex(item => item.cat_name === '大家电')
				if (index1 !== -1 && index2 !== -1) {
					const temp = this.cateList[index1]
					this.cateList[index1] = this.cateList[index2]
					this.cateList[index2] = temp
				}

				// 3. 安全检查：防止 active 索引因数据变化越界
				if (this.active >= this.cateList.length) this.active = 0
				
				// 4. 初始化默认显示的二级分类数据
				this.cateLevel2 = this.cateList[this.active].children.filter(item => !['冲锋衣', '其他'].includes(item.cat_name))
			},
			
			/**
			 * 一级分类项切换事件
			 * @param {Number} i 点击的分类索引
			 */
			activeChanged(i) {
				this.active = i
				// 重新计算二级分类数据并过滤
				this.cateLevel2 = this.cateList[i].children.filter(item => !['冲锋衣', '其他'].includes(item.cat_name))
				
				// 重置右侧滚动条位置：
				// 由于 scroll-view 监听 scrollTop 变化，如果值没变则不会触发滚动。
				// 通过在 0 和 0.1 之间微调，确保每次切换都能触发滚动重置。
				this.scrollTop = this.scrollTop === 0 ? 0.1 : 0
			},
			
			/**
			 * 跳转至商品列表页面
			 * @param {Object} item3 三级分类项信息对象
			 */
			gotoGoodsList(item3) {
				uni.navigateTo({
					url: '/subpkg/goods_list/goods_list?cid=' + item3.cat_id
				})
			},
			
			/**
			 * 跳转至搜索页面
			 */
			gotoSearch() {
				uni.navigateTo({
					url: '/subpkg/search/search'
				})
			}
		}
	}
</script>

<style lang="scss">
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
		  transition: transform 120ms ease, opacity 120ms ease;

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
</style>
