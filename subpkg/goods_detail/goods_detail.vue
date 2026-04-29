/**
 * 商品详情页面
 * 展示商品的轮播图、价格、名称、富文本详情，并提供购物车导航及购买功能
 */
<template>
	<!-- 通过 v-if 解决商品数据加载前的价格/名称闪烁问题 -->
	<view v-if="goods_info.goods_name" class="goods-detail-container u-page u-page--page">
		<!-- 轮播图区域 -->
		<view class="gallery u-card--shadow">
			<swiper :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000" :circular="true" indicator-active-color="#C00000">
				<swiper-item v-for="(item, i) in goods_info.pics" :key="i">
					<!-- 点击大图预览 -->
					<image :src="item.pics_big" @click="preview(i)"></image>
				</swiper-item>
			</swiper>
		</view>
		
		<!-- 商品基础信息区域 -->
		<view class="goods-info-box u-card--shadow">
			<view class="price-row">
				<!-- 商品价格 -->
				<view class="price">￥{{goods_info.goods_price}}</view>
				<!-- 收藏按钮（演示 UI） -->
				<view class="favi u-chip u-chip--outline u-pressable">
					<uni-icons type="star" size="16" color="#909399"></uni-icons>
					<text>收藏</text>
				</view>
			</view>
			<!-- 商品标题 -->
			<view class="goods-name">{{goods_info.goods_name}}</view>
			<!-- 运费及服务说明 -->
			<view class="yf u-text-muted">快递：免运费</view>
		</view>
		
		<!-- 商品详情富文本区域 -->
		<view class="goods-rich u-card--shadow">
			<!-- 使用 rich-text 渲染后端返回的 HTML 字符串 -->
			<rich-text :nodes="goods_info.goods_introduce"></rich-text>
		</view>
		
		<!-- 底部商品导航组件 -->
		<view class="goods_nav u-fixed-footer">
			<!-- fill: 按钮是否填满; options: 左侧功能图标; buttonGroup: 右侧操作按钮 -->
			<uni-goods-nav :fill="true" :options="options" :buttonGroup="buttonGroup" @click="onClick" @buttonClick="buttonClick"/>
		</view>
		
		<!-- 底部占位：防止固定定位的导航栏遮挡详情内容 -->
		<view class="u-fixed-footer-spacer"></view>
	</view>
</template>

<script>
	// 导入 Vuex 映射工具
	import { mapState, mapMutations, mapGetters } from 'vuex'
	
	export default {
		data() {
			return {
				// 商品详情数据对象
				goods_info: {},
				// 左侧图标按钮配置
				options: [{
					icon: 'headphones',
					text: '客服'
				}, {
					icon: 'shop',
					text: '店铺'
				}, {
					icon: 'cart',
					text: '购物车',
					info: 0 // 徽标数值，映射自购物车总数
				}],
				// 右侧功能按钮配置
				buttonGroup: [{
					text: '加入购物车',
					backgroundColor: '#ffa200',
					color: '#fff'
				},{
					text: '立即购买',
					backgroundColor: '#C00000',
					color: '#fff'
				}]
			};
		},

		computed: {
			// 映射购物车商品总数，用于更新导航栏徽标
			...mapGetters('m_cart', ['total']),
			// 映射用户登录状态
			...mapState('m_user', ['token']),
		},

		watch: {
			/**
			 * 侦听 total 变化，实时更新购物车图标上的徽标
			 * 使用对象形式确保页面首次加载时即生效
			 */
		    total: {
		        handler(newVal) {
		          const findResult = this.options.find(x => x.text === '购物车')
		          if (findResult) {
		            findResult.info = newVal
		          }
		        },
		        immediate: true
		    }
		},

		/**
		 * 页面加载生命周期
		 * @param {Object} options 包含 goods_id 的参数对象
		 */
		onLoad(options) {
			const goods_id = options.goods_id
			this.getGoodsDetail(goods_id)
		},

		methods: {
			// 映射 Vuex 变更方法
			...mapMutations('m_cart', ['addToCart']),
			...mapMutations('m_user', ['updateRedirectInfo']),
			
			/**
			 * 获取商品详情数据
			 * @param {Number|String} goods_id 商品 ID
			 */
			async getGoodsDetail(goods_id) {
				const { data: res } = await uni.$http.get('/api/public/v1/goods/detail', { goods_id })
				if (res.meta.status !== 200) return uni.$showMsg()
				
				// 数据清洗：解决图片间隙及 iOS 不支持 webp 格式的问题
				res.message.goods_introduce = res.message.goods_introduce
					.replace(/<img /g, '<img style="display:block;" ')
					.replace(/webp/g, 'jpg')
					
				this.goods_info = res.message
			},
			
			/**
			 * 图片全屏预览
			 * @param {Number} i 当前点击的图片索引
			 */
			preview(i) {
				uni.previewImage({
					current: i,
					urls: this.goods_info.pics.map(x => x.pics_big)
				})
			},
			
			/**
			 * 左侧图标按钮点击回调
			 * @param {Object} e 点击项的配置对象
			 */
			onClick(e) {
				if (e.content.text === '客服') {
					uni.navigateTo({ url: '/subpkg/contact/contact' })
				} else if (e.content.text === '购物车') {
					// 跳转至非 TabBar 购物车分包页面
					uni.navigateTo({ url: '/subpkg/cart/cart' })
				}
			},
			
			/**
			 * 右侧操作按钮点击回调
			 * @param {Object} e 点击按钮的配置对象
			 */
			buttonClick(e) {
				// 1. 拦截未登录状态，引导至登录页
				if (!this.token) {
					uni.showToast({ title: '请先登录！', icon: 'none', duration: 1500 })
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/my/my',
							success: () => {
								// 记录重定向信息，以便登录后返回
								this.updateRedirectInfo({
									openType: 'switchTab',
									from: '/subpkg/goods_detail/goods_detail?goods_id=' + this.goods_info.goods_id
								})
							}
						})
					}, 1500)
					return
				}

				// 2. 根据按钮文字执行不同业务
				if (e.content.text === '加入购物车') {
				  const goods = {
					goods_id: this.goods_info.goods_id,
					goods_name: this.goods_info.goods_name,
					goods_price: this.goods_info.goods_price,
					goods_count: 1,
					goods_small_logo: this.goods_info.goods_small_logo,
					goods_state: true
				  }
				  
				  uni.showModal({
					title: '加入购物车',
					content: '确定要将此商品加入购物车吗？',
					confirmColor: '#C00000',
					success: (res) => {
						if (res.confirm) {
						  this.addToCart(goods)
						  
						  // 加入成功后引导查看
						  setTimeout(() => {
							  uni.showModal({
								title: '提示',
								content: '商品已成功加入购物车，是否立即前往查看？',
								confirmText: '去购物车',
								cancelText: '再逛逛',
								confirmColor: '#C00000',
								success: (res2) => {
									if (res2.confirm) {
										uni.navigateTo({ url: '/subpkg/cart/cart' })
									}
								}
							  })
						  }, 300)
						}
					}
				  })
				} else if (e.content.text === '立即购买') {
				  const goods = {
					goods_id: this.goods_info.goods_id,
					goods_name: this.goods_info.goods_name,
					goods_price: this.goods_info.goods_price,
					goods_count: 1,
					goods_small_logo: this.goods_info.goods_small_logo,
					goods_state: true
				  }
				  
				  uni.showModal({
					title: '立即购买',
					content: '是否立即下单购买该商品？',
					confirmColor: '#C00000',
					success: (res) => {
						if (res.confirm) {
							// 跳转至下单页面并携带商品信息
							uni.navigateTo({
								url: '/subpkg/order/order?goods=' + encodeURIComponent(JSON.stringify(goods))
							})
						}
					}
				  })
				}
			}
		},
	}
</script>

<style lang="scss">
	/* 轮播图卡片样式 */
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
	
	/* 商品基础信息容器 */
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
		/* 文字超出两行隐藏 */
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	  }

	  .yf {
		margin-top: $space-2;
		font-size: $font-sm;
	  }

	/* 富文本详情区域样式 */
	  .goods-rich {
		margin: $space-2;
		padding: $space-2;
		overflow: hidden;
	  }

	  .goods-rich :deep(img) {
		max-width: 100%;
		border-radius: $radius-md;
	}
	
	/* 底部导航栏样式 */
	  .goods_nav {
	    width: 100%;
	  }

	  .goods_nav :deep(.uni-tab__cart-box) {
		box-shadow: 0 -8rpx 24rpx rgba(31, 35, 41, 0.08);
		border-top: 1px solid $color-border-1;
	  }
</style>
