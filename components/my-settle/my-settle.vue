<template>
  <view class="my-settle-container u-fixed-footer">
    <!-- 全选 -->
    <label class="radio" @click="changeAllState">
      <radio color="#C00000" :checked="isFullCheck" /><text>全选</text>
    </label>

    <!-- 合计 -->
    <view class="amount-box">
      合计:<text class="amount">￥{{checkedGoodsAmount}}</text>
    </view>

    <!-- 结算按钮 -->
    <view class="btn-settle u-btn-primary u-pressable" @click="settlement">结算({{checkedCount}})</view>
  </view>
</template>

<script>
  import { mapGetters, mapMutations, mapState } from 'vuex'

  export default {
    data() {
      return {
        // 设置倒计时的秒数
        seconds: 3,
        // 定时器的 Id
        timer: null
      };
    },
    computed: {
      ...mapGetters('m_cart', ['checkedCount', 'total', 'checkedGoodsAmount']),
      ...mapGetters('m_user', ['addstr']),
      ...mapState('m_user', ['token']),
      ...mapState('m_cart', ['cart']),
	  // 判断选中的数量是否与全部商品数相等
      isFullCheck() {
        return this.total === this.checkedCount
      }
    },
    methods: {
      ...mapMutations('m_cart', ['updateAllGoodsState']),
      ...mapMutations('m_user', ['updateRedirectInfo']),
	  
	  // 修改购物车中所有商品的选中状态
      changeAllState() {
		// !this.isFullCheck 表示：当前全选按钮的状态取反之后，就是最新的勾选状态
        this.updateAllGoodsState(!this.isFullCheck)
      },
      // 用户点击了结算按钮
      settlement() {
        if (!this.checkedCount) return uni.$showMsg('请选择要结算的商品！')
        if (!this.token) return this.delayNavigate()
        
        // 跳转到订单页面
        uni.navigateTo({
          url: '/subpkg/order/order'
        })
      },
	  // 微信支付
      async payOrder() {
        // 1. 创建订单
        // 1.1 组织订单的信息对象
        const orderInfo = {
          // 开发期间，注释掉真实的订单价格，
          // order_price: this.checkedGoodsAmount,
          // 写死订单总价为 1 分钱
          order_price: 0.01,
          consignee_addr: this.addstr,
		  // 返回服务器所需要的商品信息数组
          goods: this.cart.filter(x => x.goods_state).map(x => ({
            goods_id: x.goods_id,
            goods_number: x.goods_count,
            goods_price: x.goods_price
          }))
        }
		// console.log(orderInfo);

        // 1.2 发起请求创建订单
        const { data: res } = await uni.$http.post('/api/public/v1/my/orders/create', orderInfo)
		// console.log(res);
        if (res.meta.status !== 200) return uni.$showMsg('创建订单失败！')
        // 1.3 得到服务器响应的“订单编号”
        const orderNumber = res.message.order_number
		// console.log(orderNumber);

        // 2. 订单预支付
        // 2.1 发起请求获取订单的支付信息
        const { data: res2 } = await uni.$http.post('/api/public/v1/my/orders/req_unifiedorder', { order_number: orderNumber })
        // 2.2 预付订单生成失败
        if (res2.meta.status !== 200) return uni.$showMsg('预付订单生成失败！')
        // 2.3 得到订单支付相关的必要参数
        const payInfo = res2.message.pay

        // 3. 发起微信支付
        // 3.1 调用 uni.requestPayment() 发起微信支付
        const [err, succ] = await uni.requestPayment(payInfo)
        // 3.2 未完成支付
        if (err) return uni.$showMsg('订单未支付！')
        // 3.3 完成了支付，进一步查询支付的结果
        const { data: res3 } = await uni.$http.post('/api/public/v1/my/orders/chkOrder', { order_number: orderNumber })
        // 3.4 检测到订单未支付
        if (res3.meta.status !== 200) return uni.$showMsg('订单未支付！')
        // 3.5 检测到订单支付完成
        uni.showToast({
          title: '订单支付完成！',
          icon: 'success'
        })
      },
      // 未登录时，延时导航到登陆页面页面
      delayNavigate() {
		// 重置倒计时秒数
        this.seconds = 3
        this.showTips(this.seconds)
		// 开启定时器
        this.timer = setInterval(() => {
		  // 秒数自减
          this.seconds--
          if (this.seconds <= 0) {
			// 清除定时器
            clearInterval(this.timer)
			// 跳转到登录页面
            uni.switchTab({
              url: '/pages/my/my',
			  // 成功后的回调函数
              success: () => {
				// 调用 vuex 的 updateRedirectInfo 方法，把跳转信息存储到 Store 中
                this.updateRedirectInfo({
				  // 跳转的方式
                  openType: 'switchTab',
				  // 从哪个页面跳转过去的
                  from: '/pages/cart/cart'
                })
              }
            })
			// 终止后续代码的运行（当秒数为 0 时，不再展示 toast 提示消息）
            return
          }
		  // 根据最新的秒数，进行消息提示
          this.showTips(this.seconds)
        }, 1000)
      },
      // 展示倒计时的提示消息
      showTips(n) {
		// 调用 uni.showToast() 方法，展示提示消息
        uni.showToast({
          icon: 'none', // 不展示任何图标
          title: '请登录后再结算！' + n + '秒之后自动跳转到登录页',
          mask: true,  // 为页面添加透明遮罩，防止点击穿透
          duration: 1500 // 1.5 秒后自动消失
        })
      }
    }
  }
</script>

<style lang="scss">
  .my-settle-container {
    height: 50px;
    background-color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    padding-left: 5px;

    .radio {
      display: flex;
      align-items: center;
    }

    .amount-box {
      .amount {
        color: $color-primary-600;
        font-weight: bold;
      }
    }

    .btn-settle {
      height: 50px;
      line-height: 50px;
      padding: 0 10px;
      min-width: 100px;
      text-align: center;
    }
  }
</style>
