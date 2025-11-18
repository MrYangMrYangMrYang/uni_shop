<template>
	<!-- 空白购物车区域 -->
	<view class="empty-cart" v-if="cart.length === 0">
		<image src="/static/cart_empty@2x.png" class="empty-img"></image>
		<text class="tip-text">空空如也~</text>
	</view>
	
	<!-- 有商品的区域 -->
	<view class="cart-container" v-else>
		<!-- 自定义收货地址组件 -->
		<my-address></my-address>
		
		<!-- 购物车商品列表的标题区域 -->
		<view class="cart-title">
			<!-- 左侧的图标 -->
			<uni-icons type="shop" size="18"></uni-icons>
			<!-- 描述文本 -->
			<text class="cart-title-text">购物车</text>
		</view>
		
		<!-- 商品列表区域 -->
		<uni-swipe-action>
		    <block v-for="(goods, i) in cart" :key="i">
		        <uni-swipe-action-item :options="options" @click="swipeItemClickHandler(goods)">
					<my-goods :goods="goods" :show-radio="true" :show-num="true" @radio-change="radioChangeHandler" @num-change="numberChangeHandler"></my-goods>
		        </uni-swipe-action-item>
		    </block>
		</uni-swipe-action>
		
		<!-- 自定义结算区域组件 -->
		<my-settle></my-settle>
	</view>
</template>

<script>
	// 导入自己封装的 mixin 模块
	import badgeMix from '@/mixins/tabbar-badge.js'
	// 按需导入vuex的辅助函数
	import { mapState, mapMutations } from 'vuex'
	
	export default {
		// 将 badgeMix 混入到当前的页面中进行使用
		mixins: [badgeMix],
		data() {
			return {
				options: [{
					text: '删除', // 显示的文本内容
					style: {
						backgroundColor: '#C00000' // 按钮的背景颜色
					}
				}]
			};
		},
		computed: {
			// 将 m_cart 模块中的 cart 数组映射到当前页面中使用
			...mapState('m_cart', ['cart']),
		},
		methods: {
			...mapMutations('m_cart', ['updateGoodsState','updateGoodsCount','removeGoodsById']),
			// 获取商品改变后的勾选状态，再通过store提供的方法进行修改
			radioChangeHandler(e) {
				// console.log(e) // 输出得到的数据 -> {goods_id: 395, goods_state: false}
				this.updateGoodsState(e)
			},
			// 获取改变后的商品数量，再通过store提供的方法进行状态修改
			numberChangeHandler(e) {
				this.updateGoodsCount(e)
			},
			// 根据id删除对应的商品
			swipeItemClickHandler(goods) {
				this.removeGoodsById(goods.goods_id)
			}
		}
	}
</script>

<style lang="scss">
	 .cart-container {
	    padding-bottom: 50px;
	  }
	
	  .cart-title {
	    height: 40px;
	    display: flex;
	    align-items: center;
	    padding-left: 5px;
	    border-bottom: 1px solid #EFEFEF;
	
	    .cart-title-text {
	      font-size: 14px;
	      margin-left: 10px;
	    }
	  }
	
	  .empty-cart {
	    display: flex;
	    flex-direction: column;
	    align-items: center;
	    padding-top: 150px;
	
	    .empty-img {
	      width: 90px;
	      height: 90px;
	    }
	
	    .tip-text {
	      font-size: 12px;
	      color: gray;
	      margin-top: 15px;
	    }
	  }
</style>
