/** * 商品详情页面 * 展示商品的轮播图、价格、名称、富文本详情，并提供购物车导航及购买功能 */
<template>
	<!-- 骨架屏：数据加载前展示，避免价格/名称闪烁 -->
	<view v-if="isLoading" class="skeleton-detail">
		<u-skeleton mode="detail" :rows="6" />
	</view>
	<!-- 网络异常兜底 -->
	<u-network-error
		v-else-if="pageError"
		:text="errorMessage"
		:sub-text="isPageNetworkError ? '请检查网络后重试' : '请下拉刷新或点击重试'"
		@retry="retry"
	/>
	<!-- 商品详情内容 -->
	<view v-else-if="goods_info.goods_name" class="goods-detail-container u-page u-page--page">
		<!-- 轮播图区域 -->
		<view class="gallery u-card--shadow">
			<swiper
				:indicator-dots="true"
				:autoplay="true"
				:interval="3000"
				:duration="1000"
				:circular="true"
				indicator-active-color="#C00000"
			>
				<swiper-item v-for="(item, i) in goods_info.pics" :key="i">
					<u-image :src="item.pics_big" mode="aspectFill" @click.native="preview(i)" />
				</swiper-item>
			</swiper>
		</view>

		<!-- 商品基础信息区域 -->
		<view class="goods-info-box u-card--shadow">
			<view class="price-row">
				<view class="price">{{ goods_info.goods_price | formatPrice }}</view>
				<view class="favi u-chip u-chip--outline u-pressable">
					<uni-icons type="star" size="16" color="#909399"></uni-icons>
					<text>收藏</text>
				</view>
			</view>
			<view class="goods-name">{{ goods_info.goods_name }}</view>
			<view class="yf u-text-muted">快递：免运费</view>
		</view>

		<!-- 商品详情富文本区域 -->
		<view class="goods-rich u-card--shadow">
			<rich-text :nodes="goods_info.goods_introduce"></rich-text>
		</view>

		<!-- 底部商品导航组件 -->
		<view class="goods_nav u-fixed-footer">
			<uni-goods-nav
				:fill="true"
				:options="options"
				:buttonGroup="buttonGroup"
				@click="onClick"
				@buttonClick="buttonClick"
			/>
		</view>
		<view class="u-fixed-footer-spacer"></view>
	</view>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex';
import authGuard from '@/mixins/auth-guard.js';
import errorBoundary from '@/mixins/error-boundary.js';
import USkeleton from '@/components/u-skeleton/u-skeleton.vue';
import UNetworkError from '@/components/u-network-error/u-network-error.vue';
import { getGoodsDetail } from '@/api/goods.js';

export default {
	components: {
		'u-skeleton': USkeleton,
		'u-network-error': UNetworkError
	},
	mixins: [authGuard, errorBoundary],
	data() {
		return {
			isLoading: true,
			goods_info: {},
			options: [
				{ icon: 'headphones', text: '客服' },
				{ icon: 'shop', text: '店铺' },
				{ icon: 'cart', text: '购物车', info: 0 }
			],
			buttonGroup: [
				{ text: '加入购物车', backgroundColor: '#ffa200', color: '#fff' },
				{ text: '立即购买', backgroundColor: '#C00000', color: '#fff' }
			]
		};
	},

	computed: {
		...mapGetters('m_cart', ['total'])
	},

	watch: {
		total: {
			handler(newVal) {
				const findResult = this.options.find(x => x.text === '购物车');
				if (findResult) {
					findResult.info = newVal;
				}
			},
			immediate: true
		}
	},

	onLoad(options) {
		const goods_id = options.goods_id;
		this.getGoodsDetailData(goods_id);
	},

	methods: {
		...mapMutations('m_cart', ['addToCart']),

		async getGoodsDetailData(goods_id) {
			await this.withErrorBoundary(
				async () => {
					const { data: res } = await getGoodsDetail(goods_id);
					if (res.meta.status !== 200) return uni.$showMsg();

					res.message.goods_introduce = res.message.goods_introduce
						.replace(/<img /g, '<img style="display:block;" ')
						.replace(/webp/g, 'jpg');

					this.goods_info = res.message;
				},
				{ errorMessage: '商品详情加载失败' }
			);
			this.isLoading = false;
		},

		preview(i) {
			uni.previewImage({
				current: i,
				urls: this.goods_info.pics.map(x => x.pics_big)
			});
		},

		onClick(e) {
			if (e.content.text === '客服') {
				uni.navigateTo({ url: '/subpkg/contact/contact' });
			} else if (e.content.text === '购物车') {
				uni.navigateTo({ url: '/subpkg/cart/cart' });
			}
		},

		buttonClick(e) {
			if (this._submitLock) return;

			if (!this.checkLogin('/subpkg/goods_detail/goods_detail?goods_id=' + this.goods_info.goods_id)) return;

			const goods = {
				goods_id: this.goods_info.goods_id,
				goods_name: this.goods_info.goods_name,
				goods_price: this.goods_info.goods_price,
				goods_count: 1,
				goods_small_logo: this.goods_info.goods_small_logo,
				goods_state: true
			};

			if (e.content.text === '加入购物车') {
				this._submitLock = true;
				this.addToCart(goods);

				uni.showToast({
					title: '已加入购物车',
					icon: 'success',
					duration: 1500
				});

				setTimeout(() => {
					this._submitLock = false;
				}, 500);
			} else if (e.content.text === '立即购买') {
				this._submitLock = true;
				// P2-23: 改用 store 传递商品数据，避免 URL 传 JSON 超长限制
				this.$store.commit('m_cart/setBuyNowGoods', goods);
				uni.navigateTo({
					url: '/subpkg/order/order',
					complete: () => {
						this._submitLock = false;
					}
				});
			}
		}
	}
};
</script>

<style lang="scss">
.gallery {
	margin: $space-2;
	overflow: hidden;
}

swiper {
	height: 680rpx;

	image {
		width: 100%;
		height: 100%;
	}
}

.goods-info-box {
	margin: $space-2;
	padding: $space-3;
}

.price-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: $space-2;
}

.price {
	color: $color-primary-600;
	font-size: $font-xl;
	font-weight: 800;
}

.goods-name {
	margin-top: $space-2;
	font-size: $font-md;
	font-weight: 700;
	line-height: 1.35;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.yf {
	margin-top: $space-2;
	font-size: $font-sm;
}

.goods-rich {
	margin: $space-2;
	padding: $space-2;
	overflow: hidden;
}

.goods-rich :deep(img) {
	max-width: 100%;
	border-radius: $radius-md;
}

.goods_nav {
	width: 100%;
}

.goods_nav :deep(.uni-tab__cart-box) {
	box-shadow: 0 -8rpx 24rpx rgba(31, 35, 41, 0.08);
	border-top: 1px solid $color-border-1;
}

.skeleton-detail {
	padding: $space-2;
}
</style>
