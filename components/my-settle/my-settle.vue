<!-- 
  结算组件
  用于购物车底部，展示合计金额、全选控制以及跳转结算
-->
<template>
  <view class="my-settle-container u-fixed-footer">
    <!-- 全选控制区域 -->
    <label class="radio" @click="changeAllState">
      <radio :color="primaryColor" :checked="isFullCheck" /><text>全选</text>
    </label>

    <!-- 合计金额展示 -->
    <view class="amount-box">
      合计:<text class="amount">￥{{checkedGoodsAmount}}</text>
    </view>

    <!-- 结算按钮：展示已选商品数量 -->
    <view class="btn-settle u-btn-primary u-pressable" @click="settlement">结算({{checkedCount}})</view>
  </view>
</template>

<script>
  import { mapGetters, mapMutations, mapState } from 'vuex'
  import authGuard from '@/mixins/auth-guard.js'

  export default {
    name: 'my-settle',
    mixins: [authGuard],
    data() {
      return {
        // 登录倒计时秒数
        seconds: 3,
        // 倒计时定时器引用
        timer: null,
        // 主题色，与全局样式保持一致
        primaryColor: '#C00000'
      };
    },
    computed: {
      // 映射购物车模块的 Getters：已选商品数量、总商品数、已选商品总金额
      ...mapGetters('m_cart', ['checkedCount', 'total', 'checkedGoodsAmount']),
      // 映射用户模块的 Getters 和 State：完整地址字符串、登录 Token
      ...mapGetters('m_user', ['addstr']),
      ...mapState('m_cart', ['cart']),
      
	  /**
       * 判断是否处于全选状态
       * 逻辑：当前购物车中所有商品的数量是否等于已勾选商品的数量
       * @returns {Boolean} 是否全选
       */
      isFullCheck() {
        return this.total === this.checkedCount
      }
    },
    methods: {
      ...mapMutations('m_cart', ['updateAllGoodsState']),
	  
	  /**
       * 切换全选/全不选状态的回调逻辑
       */
      changeAllState() {
        // 将当前全选状态取反后更新到 Vuex
        this.updateAllGoodsState(!this.isFullCheck)
      },

      /**
       * 点击结算按钮的处理逻辑
       * 1. 验证是否有选中的商品
       * 2. 验证用户是否登录
       * 3. 未登录时开启倒计时提示并自动跳转登录页
       * 4. 已登录且有选中商品时跳转到订单结算页
       */
      settlement() {
        // 1. 判断是否勾选了商品
        if (!this.checkedCount) return uni.$showMsg('请选择要结算的商品！')
        
        // 2. 判断用户是否登录
        if (!this.token) return this.delayNavigate()
        
        // 3. 跳转到订单详情/确认页面
        uni.navigateTo({
          url: '/subpkg/order/order'
        })
      },

	  /**
       * 微信支付完整流程逻辑（业务参考）
       * 包含：创建订单 -> 获取预支付参数 -> 发起微信支付 -> 验证支付结果
       */
      async payOrder() {
        // 1. 构造创建订单所需的参数对象
        const orderInfo = {
          order_price: 0.01, // 此处仅为演示，实际应使用 this.checkedGoodsAmount
          consignee_addr: this.addstr,
          goods: this.cart.filter(x => x.goods_state).map(x => ({
            goods_id: x.goods_id,
            goods_number: x.goods_count,
            goods_price: x.goods_price
          }))
        }

        // 2. 发起后端接口请求创建订单
        const { data: res } = await uni.$http.post('/api/public/v1/my/orders/create', orderInfo)
        if (res.meta.status !== 200) return uni.$showMsg('创建订单失败！')
        const orderNumber = res.message.order_number

        // 3. 根据订单号获取微信预支付相关的参数（payInfo）
        const { data: res2 } = await uni.$http.post('/api/public/v1/my/orders/req_unifiedorder', { order_number: orderNumber })
        if (res2.meta.status !== 200) return uni.$showMsg('预付订单生成失败！')
        const payInfo = res2.message.pay

        // 4. 调用微信原生支付接口发起支付请求
        const [err, succ] = await uni.requestPayment(payInfo)
        if (err) return uni.$showMsg('订单未支付！')
        
        // 5. 支付完成后，调用后端接口查询订单状态，确保支付成功
        const { data: res3 } = await uni.$http.post('/api/public/v1/my/orders/chkOrder', { order_number: orderNumber })
        if (res3.meta.status !== 200) return uni.$showMsg('订单未支付！')
        
        // 6. 支付成功提示
        uni.showToast({
          title: '订单支付完成！',
          icon: 'success'
        })
      },

      /**
       * 未登录时的延时导航提示逻辑
       * 开启一个 3 秒的倒计时，每秒更新一次 Toast 提示，倒计时结束后跳转到登录页
       */
      delayNavigate() {
        // 重置倒计时秒数
        this.seconds = 3
        // 立即显示第一次提示
        this.showTips(this.seconds)

        // 创建定时器
        this.timer = setInterval(() => {
          this.seconds--
          if (this.seconds <= 0) {
            // 倒计时结束，清除定时器并执行跳转
            clearInterval(this.timer)
            this.navigateToLogin('/pages/cart/cart')
            return
          }
          // 每秒更新一次提示内容
          this.showTips(this.seconds)
        }, 1000)
      },

      /**
       * 封装倒计时提示消息
       * @param {Number} n 当前剩余的秒数
       */
      showTips(n) {
        uni.showToast({
          icon: 'none',
          title: '请登录后再结算！' + n + '秒之后自动跳转到登录页',
          mask: true, // 防止点击穿透
          duration: 1500
        })
      }
    }
  }
</script>

<style lang="scss">
  /* 结算栏容器：固定在底部 */
  .my-settle-container {
    height: 50px;
    background-color: $color-bg;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: $font-md;
    padding-left: $space-1;

    /* 全选 radio 区域 */
    .radio {
      display: flex;
      align-items: center;
    }

    /* 合计金额显示区域 */
    .amount-box {
      .amount {
        color: $color-primary-600;
        font-weight: bold;
      }
    }

    /* 结算按钮样式 */
    .btn-settle {
      height: 50px;
      line-height: 50px;
      padding: 0 10px;
      min-width: 100px;
      text-align: center;
    }
  }
</style>
