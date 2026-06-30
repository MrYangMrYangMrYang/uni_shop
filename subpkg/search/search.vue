<template>
	<view class="u-page u-page--page">
		<!-- 搜索区域：始终固定在顶部 -->
		<view class="search-bar">
			<uni-search-bar @input="input" :radius="100" cancelButton="none" class="search-input"></uni-search-bar>
			<text class="search-btn" @click="doSearch">搜索</text>
		</view>
		<view class="search-spacer"></view>

		<!-- 热搜推荐（仅在未输入关键词时展示） -->
		<view class="hot-search" v-if="searchResults.length === 0 && kw === ''">
			<view class="hot-search__title">
				<text class="hot-search__title-text">🔥 热门搜索</text>
			</view>
			<view class="hot-search__list">
				<view class="hot-search__tag" v-for="(item, i) in hotSearchList" :key="i" @click="gotoGoodsList(item)">
					{{ item }}
				</view>
			</view>
		</view>

		<!-- 搜索建议列表 -->
		<view class="sugg-list" v-if="searchResults.length !== 0">
			<view class="sugg-item" v-for="(item, i) in searchResults" :key="i" @click="gotoGoodsList(item.goods_name)">
				<view class="goods-name">{{ item.goods_name }}</view>
				<uni-icons type="arrowright" size="16"></uni-icons>
			</view>
		</view>

		<!-- 搜索历史 -->
		<view class="history-box" v-else-if="searchResults.length === 0">
			<!-- 标题区域 -->
			<view class="history-title">
				<text class="history-title__text">搜索历史</text>
				<view class="history-clear" @click="cleanHistory" v-if="historyList.length > 0">
					<uni-icons type="trash" size="14" color="#999"></uni-icons>
					<text class="history-clear__text">清空</text>
				</view>
			</view>
			<!-- 列表区域 -->
			<view class="history-list" v-if="historyList.length > 0">
				<view class="history-tag" v-for="(item, i) in historys" :key="i" @click="gotoGoodsList(item)">
					<text class="history-tag__text">{{ item }}</text>
				</view>
			</view>
			<view class="history-empty" v-else>
				<text class="history-empty__text">暂无搜索历史</text>
			</view>
		</view>
	</view>
</template>

<script>
import { getSearchSuggest } from '@/api/goods.js';

/**
 * 搜索页面
 * 负责商品搜索、搜索建议展示、热搜推荐以及搜索历史记录的管理
 * - 热搜：mock 推荐关键词
 * - 历史：最多保留 20 条，LRU 淘汰
 * - 清空历史：需二次确认
 * - 联想词：点击跳搜索列表（与历史点击行为一致）
 */
export default {
	data() {
		return {
			timer: null,
			kw: '',
			searchResults: [],
			historyList: [],
			// mock 热搜词
			hotSearchList: [
				'iPhone 15',
				'华为 Mate 60',
				'小米 14',
				'AirPods Pro',
				'机械键盘',
				'显示器',
				'运动鞋',
				'羽绒服',
				'咖啡机',
				'面膜'
			]
		};
	},
	onLoad() {
		this.historyList = JSON.parse(uni.getStorageSync('kw') || '[]');
	},
	computed: {
		// 反转后展示，使最新搜索的关键词排在最前
		historys() {
			return [...this.historyList].reverse();
		}
	},
	methods: {
		doSearch() {
			if (this._searchLock) return;
			if (this.kw.trim() === '') {
				uni.showToast({
					title: '请输入搜索内容',
					icon: 'none',
					duration: 1500
				});
				return;
			}
			this._searchLock = true;
			this.saveSearchHistory();
			uni.navigateTo({
				url: '/subpkg/goods_list/goods_list?query=' + this.kw,
				complete: () => {
					this._searchLock = false;
				}
			});
		},

		// 输入防抖：停止输入 500ms 后再查询
		input(e) {
			clearTimeout(this.timer);
			this.timer = setTimeout(() => {
				this.kw = e.value;
				this.getSearchList();
			}, 500);
		},

		async getSearchList() {
			if (this.kw === '') {
				this.searchResults = [];
				return;
			}
			const { data: res } = await getSearchSuggest(this.kw);
			if (res.meta.status !== 200) return uni.$showMsg();
			this.searchResults = res.message;
		},

		saveSearchHistory() {
			// 利用 Set 去重：先删除旧关键词再添加，使其排在末尾（反转后位于最前）
			const set = new Set(this.historyList);
			set.delete(this.kw);
			set.add(this.kw);
			let list = Array.from(set);
			// 历史记录上限：保留最近 20 条
			if (list.length > 20) {
				list = list.slice(list.length - 20);
			}
			this.historyList = list;

			uni.setStorageSync('kw', JSON.stringify(this.historyList));
		},

		// 清空搜索历史（二次确认）
		cleanHistory() {
			uni.showModal({
				title: '提示',
				content: '确认要清空所有搜索历史吗？',
				confirmColor: '#C00000',
				success: res => {
					if (res.confirm) {
						this.historyList = [];
						uni.setStorageSync('kw', '[]');
						uni.showToast({
							title: '已清空',
							icon: 'none',
							duration: 1000
						});
					}
				}
			});
		},

		// 联想词点击 → 跳搜索列表（与历史点击行为一致）
		gotoGoodsList(keyword) {
			this.saveSearchHistory();
			// 如果当前 kw 不是该关键词，先更新 kw
			if (this.kw !== keyword) {
				this.kw = keyword;
			}
			uni.navigateTo({
				url: '/subpkg/goods_list/goods_list?query=' + keyword
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
	display: flex;
	align-items: center;

	.search-input {
		flex: 1;
		display: block !important;
		width: 100% !important;
		max-width: none !important;
		min-width: 0;
	}

	.search-btn {
		flex-shrink: 0;
		margin-left: auto;
		padding: 12rpx 20rpx;
		font-size: $font-md;
		font-weight: 600;
		color: #ffffff;

		&:active {
			opacity: 0.7;
		}
	}
}

.search-spacer {
	height: 120rpx;
}

/* 热搜推荐区域 */
.hot-search {
	padding: 0 $space-2;

	.hot-search__title {
		padding: $space-3 0;
		margin-bottom: $space-1;

		.hot-search__title-text {
			font-size: $font-md;
			font-weight: 600;
			color: $color-text-900;
		}
	}

	.hot-search__list {
		display: flex;
		flex-wrap: wrap;
		gap: $space-2;

		.hot-search__tag {
			padding: 10rpx 24rpx;
			background: $color-primary-light;
			border-radius: $radius-pill;
			border: 1px solid rgba(192, 0, 0, 0.15);
			font-size: $font-sm;
			color: $color-primary-600;

			&:active {
				opacity: 0.7;
			}
		}
	}
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
		transition:
			transform 120ms ease,
			opacity 120ms ease;
		border-radius: $radius-md;

		.goods-name {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			margin-right: $space-1;
		}
	}
}

/* 搜索历史区域样式 */
.history-box {
	padding: $space-3 $space-2 0;

	.history-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: $space-3;

		&__text {
			font-size: $font-md;
			font-weight: 600;
			color: $color-text-900;
		}

		.history-clear {
			display: flex;
			align-items: center;
			gap: 4rpx;
			padding: 8rpx 16rpx;
			border-radius: $radius-pill;
			background: $color-bg-soft;

			&__text {
				font-size: $font-xs;
				color: $color-text-300;
			}

			&:active {
				opacity: 0.7;
			}
		}
	}

	.history-list {
		display: flex;
		flex-wrap: wrap;
		gap: $space-2;

		.history-tag {
			padding: 10rpx 24rpx;
			background: $color-bg-soft;
			border-radius: $radius-pill;
			border: 1px solid $color-border-1;

			&__text {
				font-size: $font-sm;
				color: $color-text-700;
			}

			&:active {
				background: $color-primary-light;
				border-color: rgba(192, 0, 0, 0.15);
			}
		}
	}

	.history-empty {
		padding: $space-6 0;
		text-align: center;

		.history-empty__text {
			font-size: $font-sm;
			color: $color-text-muted;
		}
	}
}
</style>
