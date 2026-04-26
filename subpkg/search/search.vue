<template>
	<view class="u-page u-page--page">
		<!-- 搜索框 -->
		<view class="search-box u-sticky-top u-header-brand u-header-elevated u-brand-header">
			<!-- 使用 uni-ui 提供的搜索组件 -->
			<uni-search-bar @input="input" :radius="100" cancelButton="none"></uni-search-bar>
		</view>
		
		<!-- 搜索建议列表 -->
		<view class="sugg-list" v-if="searchResults.length !== 0">
		  <view class="sugg-item" v-for="(item, i) in searchResults" :key="i" @click="gotoDetail(item)">
			<view class="goods-name">{{item.goods_name}}</view>
			<uni-icons type="arrowright" size="16"></uni-icons>
		  </view>
		</view>
		
		<!-- 搜索历史 -->
		<view class="history-box" v-else>
			<!-- 标题区域 -->
			<view class="history-title">
				<text>搜索历史</text>
				<uni-icons type="trash" size="18" @click="cleanHistory"></uni-icons>
			</view>
			<!-- 列表区域 -->
			<view class="history-list">
				<uni-tag :text="item" v-for="(item, i) in historys" :key="i" @click="gotoGoodsList(item)"></uni-tag>
			</view>
		</view>
	</view>
</template>

<script>
	/**
	 * 搜索页面
	 * 负责商品搜索、搜索建议展示以及搜索历史记录的管理
	 */
	export default {
		data() {
			return {
				// 延时器的 timerId，用于防抖处理
				timer: null,
				// 搜索关键词
				kw: '',
				// 搜索结果列表（搜索建议）
				searchResults: [],
				// 搜索关键词的历史记录（原始数组）
				historyList: []
			};
		},
		/**
		 * 页面加载生命周期函数
		 */
		onLoad() {
			// 加载本地存储的搜索历史记录
			this.historyList = JSON.parse(uni.getStorageSync('kw') || '[]')
		},
		computed: {
			/**
			 * 格式化后的搜索历史记录
			 * 解决关键字前后顺序的问题：新搜索的在前面
			 * @returns {Array} 反转后的历史记录数组
			 */
			historys() {
				// 注意：由于数组是引用类型，所以不要直接基于原数组调用 reverse 方法，以免修改原数组中元素的顺序
				// 而是应该新建一个内存无关的数组，再进行 reverse 反转
				return [...this.historyList].reverse()
			}
		},
		methods: {
			/**
			 * 搜索框输入事件处理（防抖）
			 * @param {Object} e 输入事件对象
			 */
			input(e) {
				// 清除上一次的延时器
				clearTimeout(this.timer)
				// 重新启动一个延时器，延迟 500ms 执行搜索逻辑
				this.timer = setTimeout(() => {
					// 为搜索关键词赋值
					this.kw = e.value
					// 根据关键词，查询搜索建议列表
					this.getSearchList()
				}, 500)
			},
			
			/**
			 * 根据搜索关键词获取商品建议列表
			 */
			async getSearchList() {
				// 判断关键词是否为空
				if (this.kw === '') {
					this.searchResults = []
					return
				}
				// 发起网络请求，获取搜索建议
				const { data: res } = await uni.$http.get('/api/public/v1/goods/qsearch', { query: this.kw })
				// 请求失败处理
				if (res.meta.status !== 200) return uni.$showMsg()
				// 更新搜索结果
				this.searchResults = res.message
				
				// 查询到搜索建议之后，保存搜索关键词到历史记录
				this.saveSearchHistory()
			},
			
			/**
			 * 将当前搜索关键词保存到历史记录中
			 * 包含去重处理和持久化存储
			 */
			saveSearchHistory() {
				// 1. 解决关键词重复的问题
				const set = new Set(this.historyList)
				// 先删除已存在的相同关键词
				set.delete(this.kw)
				// 再添加当前关键词，确保它排在 Set 的最后（反转后就在最前）
				set.add(this.kw)
				// 将 Set 转换回数组
				this.historyList = Array.from(set)
				
				// 2. 将搜索历史记录持久化存储到本地
				uni.setStorageSync('kw', JSON.stringify(this.historyList))
			},
			
			/**
			 * 清空搜索历史记录
			 */
			cleanHistory() {
				// 清空 data 中的数据
				this.historyList = []
				// 同步清空本地存储
				uni.setStorageSync('kw', '[]')
			},
			
			/**
			 * 点击搜索建议项跳转到商品详情页
			 * @param {Object} item 商品对象
			 */
			gotoDetail(item) {
				uni.navigateTo({
					url: '/subpkg/goods_detail/goods_detail?goods_id=' + item.goods_id
				})
			},

			/**
			 * 点击搜索历史标签跳转到商品列表页
			 * @param {String} item 搜索关键词
			 */
			gotoGoodsList(item) {
				uni.navigateTo({
					url: '/subpkg/goods_list/goods_list?query=' + item
				})
			}
		}
	}
</script>

<style lang="scss">
	/* 搜索栏样式定制 */
	.uni-searchbar {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		position: relative;
		padding: 16rpx;
		background-color: transparent;
	}
	
	/* 搜索建议列表样式 */
	.sugg-list {
		padding: 0 $space-2;
		.sugg-item {
			font-size: $font-sm;
			padding: $space-3 0;
			border-bottom: 1px solid $color-border-1;
			display: flex;
			align-items: center;
			justify-content: space-between;
			transition: transform 120ms ease, opacity 120ms ease;
			border-radius: $radius-md;

			.goods-name {
				// 文本溢出隐藏并显示省略号
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				margin-right: $space-1;
			}
		}
	}
	
	/* 搜索历史区域样式 */
	.history-box {
	    padding: 0 $space-2;
	
	    .history-title {
	      display: flex;
	      justify-content: space-between;
	      height: 80rpx;
	      align-items: center;
	      font-size: $font-md;
	      border-bottom: 1px solid $color-border-1;
	    }
	
	    .history-list {
	      display: flex;
	      flex-wrap: wrap;
	
	      .uni-tag {
	        margin-top: $space-2;
	        margin-right: $space-2;
	      }
	    }
	  }
</style>
