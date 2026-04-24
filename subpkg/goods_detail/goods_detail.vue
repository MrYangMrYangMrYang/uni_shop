<template>
	<!-- 通过v-if解决商品价格闪烁的问题 -->
	<view v-if="goods_info.goods_name" class="goods-detail-container u-page u-page--page">
		<!-- 轮播图区域 -->
		<view class="gallery u-card--shadow">
			<swiper :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000" :circular="true" indicator-active-color="#C00000">
				<swiper-item v-for="(item, i) in goods_info.pics" :key="i">
					<image :src="item.pics_big" @click="preview(i)"></image>
				</swiper-item>
			</swiper>
		</view>
		
		<!-- 商品信息区域 -->
		<view class="goods-info-box u-card--shadow">
			<view class="price-row">
				<!-- 商品价格 -->
				<view class="price">￥{{goods_info.goods_price}}</view>
				<!-- 收藏 -->
				<view class="favi u-chip u-chip--outline u-pressable">
					<uni-icons type="star" size="16" color="#909399"></uni-icons>
					<text>收藏</text>
				</view>
			</view>
			<!-- 商品的名字 -->
			<view class="goods-name">{{goods_info.goods_name}}</view>
			<!-- 运费 -->
			<view class="yf u-text-muted">快递：免运费</view>
		</view>
		
		<!-- 商品详情信息 -->
		<!-- 在页面结构中，可以使用uni-app中的 rich-text 组件，将带有 HTML 标签的内容，渲染为小程序的页面结构 -->
		<view class="goods-rich u-card--shadow">
			<rich-text :nodes="goods_info.goods_introduce"></rich-text>
		</view>
		
		<!-- 商品导航组件 -->
		<view class="goods_nav u-fixed-footer">
			<!-- fill 控制右侧按钮的样式 -->
			<!-- options 左侧按钮的配置项 -->
			<!-- buttonGroup 右侧按钮的配置项 -->
			<!-- click 左侧按钮的点击事件处理函数 -->
			<!-- buttonClick 右侧按钮的点击事件处理函数 -->
			<uni-goods-nav :fill="true" :options="options" :buttonGroup="buttonGroup" @click="onClick" @buttonClick="buttonClick"/>
		</view>
		
		<!-- 底部 fixed 商品导航占位，避免遮挡 -->
		<view class="u-fixed-footer-spacer"></view>
	</view>
</template>

<script>
	// 从 vuex 中按需导出 mapState 辅助方法
	import { mapState,mapMutations,mapGetters } from 'vuex'
	
	export default {
		data() {
			return {
				// 商品详情对象
				goods_info: {},
				// 左侧按钮组的配置对象
				options: [{
					icon: 'headphones',
					text: '客服'
				}, {
					icon: 'shop',
					text: '店铺'
				}, {
					icon: 'cart',
					text: '购物车',
					info: 0
				}],
				// 右侧按钮组的配置对象
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
			// 把 m_cart 模块中名称为 total 的 getter 映射到当前页面中使用
			...mapGetters('m_cart', ['total']),
			...mapState('m_user', ['token']),
		},
		// 使用普通函数的形式定义的 watch 侦听器，在页面首次加载后不会被调用，为了防止这个问题，可以使用对象的形式来定义 watch 侦听器
		watch: {
		    // total(newVal) {
		    //     const findResult = this.options.find(x => x.text === '购物车')
		    //     if (findResult) {
		    //       findResult.info = newVal
		    //     }
		    // }
			// 定义 total 侦听器，指向一个配置对象
		    total: {
				// handler方法 用来定义侦听器的 function 处理函数
		        handler(newVal) {
		          const findResult = this.options.find(x => x.text === '购物车')
		          if (findResult) {
		            findResult.info = newVal
		          }
		        },
				// immediate 属性用来声明此侦听器，是否在页面初次加载完毕后立即调用
		        immediate: true
		    }
		},
		onLoad(options) {
			// 获取商品 Id
			const goods_id = options.goods_id
			// 调用请求商品详情数据的方法
			this.getGoodsDetail(goods_id)
		},
		methods: {
			// 把 m_cart 模块中的 addToCart 方法映射到当前页面使用
			...mapMutations('m_cart', ['addToCart']),
			...mapMutations('m_user', ['updateRedirectInfo']),
			
		    // 定义请求商品详情数据的方法
			async getGoodsDetail(goods_id) {
				const { data: res } = await uni.$http.get('/api/public/v1/goods/detail', { goods_id })
				if (res.meta.status !== 200) return uni.$showMsg()
				// 使用字符串的 replace() 方法，为 img 标签添加行内的 style 样式，从而解决图片底部空白间隙和.webp 格式图片在 ios 设备上无法正常显示的问题
				res.message.goods_introduce = res.message.goods_introduce.replace(/<img /g, '<img style="display:block;" ').replace(/webp/g, 'jpg')
				// 为 data 中的数据赋值
				this.goods_info = res.message
			},
			
			// 实现轮播图的预览效果
			preview(i) {
				// 调用 uni.previewImage() 方法预览图片
				uni.previewImage({
					// 预览时，默认显示图片的索引
					current: i,
					// 所有图片 url 地址的数组
					urls: this.goods_info.pics.map(x => x.pics_big)
				})
			},
			
			// 点击跳转到购物车页面
			onClick(e) {
				if (e.content.text === '客服') {
					uni.navigateTo({
						url: '/subpkg/contact/contact'
					})
				} else if (e.content.text === '购物车') {
					// 使用 navigateTo 跳转到非 TabBar 的购物车页面，保留详情页在栈中
					uni.navigateTo({
						url: '/subpkg/cart/cart'
					})
				}
			},
			
			// 添加商品对象到购物车
			buttonClick(e) {
				// 1. 判断是否登录
				if (!this.token) {
					uni.showToast({
						title: '请先登录！',
						icon: 'none',
						duration: 1500
					})
					// 延迟跳转到登录页
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/my/my',
							success: () => {
								// 存储重定向信息
								this.updateRedirectInfo({
									openType: 'switchTab',
									from: '/subpkg/goods_detail/goods_detail?goods_id=' + this.goods_info.goods_id
								})
							}
						})
					}, 1500)
					return
				}

				if (e.content.text === '加入购物车') {
				  // 组织商品的信息对象
				  const goods = {
					goods_id: this.goods_info.goods_id,
					goods_name: this.goods_info.goods_name,
					goods_price: this.goods_info.goods_price,
					goods_count: 1,
					goods_small_logo: this.goods_info.goods_small_logo,
					goods_state: true
				  }
				  // 调用 addToCart 方法
				  this.addToCart(goods)
				  
				  uni.showToast({
					title: '已加入购物车',
					duration: 800,
					icon: 'none',
					mask: true
				  })

				  setTimeout(() => {
					uni.navigateTo({
						url: '/subpkg/cart/cart'
					})
				  }, 1000)
				} else if (e.content.text === '立即购买') {
				  // 立即购买：不添加到购物车，直接将商品信息传给订单页面
				  const goods = {
					goods_id: this.goods_info.goods_id,
					goods_name: this.goods_info.goods_name,
					goods_price: this.goods_info.goods_price,
					goods_count: 1,
					goods_small_logo: this.goods_info.goods_small_logo,
					goods_state: true
				  }
				  uni.navigateTo({
					url: '/subpkg/order/order?goods=' + encodeURIComponent(JSON.stringify(goods))
				  })
				}
			}
		},
	}
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
</style>
