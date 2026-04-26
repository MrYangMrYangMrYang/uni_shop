<!-- 
  收货地址组件
  用于展示已选地址或引导用户选择收货地址
  常用于购物车和结算页面
-->
<template>
  <view class="my-address u-card--shadow">
    <!-- 未选择地址时的展示状态：显示“请选择收货地址”按钮 -->
    <view class="address-choose-box" v-if="JSON.stringify(address) === '{}'">
      <button type="primary" size="mini" class="btnChooseAddress u-btn-primary u-pressable" @click="chooseAddress">请选择收货地址+</button>
    </view>

    <!-- 已选择地址时的展示状态：显示收货人、电话及详细地址 -->
    <view class="address-info-box u-pressable" v-else @click="chooseAddress">
      <view class="row1">
        <view class="row1-left">
          <view class="username">收货人：{{address.userName}}</view>
        </view>
        <view class="row1-right">
          <view class="phone">电话：{{address.telNumber}}</view>
          <uni-icons type="arrowright" size="16"></uni-icons>
        </view>
      </view>
      <view class="row2">
        <view class="row2-left">收货地址：</view>
        <view class="row2-right">{{addstr}}</view>
      </view>
    </view>

    <!-- 底部装饰性边框线（信封边框风格） -->
    <image src="/static/cart_border@2x.png" class="address-border"></image>
  </view>
</template>

<script>
  import { mapState, mapMutations, mapGetters } from 'vuex'

  /**
   * 收货地址管理组件
   * 负责展示已选收货地址、引导用户选择地址、以及地址列表的自动加载逻辑
   */
  export default {
    name: 'my-address',
    data() {
      return {};
    },
	computed: {
      // 映射 m_user 模块的状态
	  ...mapState('m_user', ['address', 'token', 'addressList']),
      // 映射 m_user 模块的 Getters，获取拼接后的完整地址字符串
	  ...mapGetters('m_user', ['addstr', 'defaultAddress'])
	},
    watch: {
      /**
       * 监听地址列表变化
       * 如果当前未选中地址且列表内有数据，则自动加载默认地址（isDefault 为 true 的项）
       */
      addressList: {
        handler(newVal) {
          if (JSON.stringify(this.address) === '{}' && newVal.length > 0) {
            const def = newVal.find(x => x.isDefault)
            if (def) {
              this.updateAddress(def)
            }
          }
        },
        immediate: true
      }
    },
    methods: {
      ...mapMutations('m_user', ['updateAddress', 'updateRedirectInfo']),
      
	  /**
       * 选择收货地址的处理逻辑
       * 1. 验证用户登录状态
       * 2. 未登录：提示并引导至登录页，记录重定向信息以便登录后跳回购物车
       * 3. 已登录：跳转至地址管理列表页面
       */
      async chooseAddress() {
		if (!this.token) {
			uni.showToast({
				title: '请先登录以管理收货地址',
				icon: 'none',
				duration: 1500
			})
			setTimeout(() => {
				uni.switchTab({
					url: '/pages/my/my',
					success: () => {
                        // 记录来源信息：页面路径和打开方式
						this.updateRedirectInfo({
							openType: 'switchTab',
							from: '/pages/cart/cart'
						})
					}
				})
			}, 1500)
			return
		}

		// 已登录状态，直接跳转到自定义地址管理页面
		uni.navigateTo({
			url: '/subpkg/address-list/address-list'
		})
      }
    },
  }
</script>

<style lang="scss">
  /* 组件容器样式 */
  .my-address {
	padding: $space-2;
	margin-bottom: $space-2;
	overflow: hidden;
  }

  /* 底部彩色边框图片 */
  .address-border {
    display: block;
    width: 100%;
    height: 5px;
  }

  /* 未选地址时的居中按钮盒子 */
  .address-choose-box {
    height: 140rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* 已选地址后的信息展示盒子 */
  .address-info-box {
    font-size: $font-sm;
    height: 140rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 $space-1;

    /* 第一行：姓名和电话 */
    .row1 {
      display: flex;
      justify-content: space-between;

      .row1-right {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    /* 第二行：详细地址 */
    .row2 {
      display: flex;
      align-items: center;
      margin-top: $space-2;

      .row2-left {
        white-space: nowrap; // 避免“收货地址：”换行
      }
    }
  }
</style>
