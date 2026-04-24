<template>
  <view class="my-address u-card--shadow">
    <!-- 选择收货地址的盒子 -->
    <view class="address-choose-box" v-if="JSON.stringify(address) === '{}'">
      <button type="primary" size="mini" class="btnChooseAddress u-btn-primary u-pressable" @click="chooseAddress">请选择收货地址+</button>
    </view>

    <!-- 渲染收货信息的盒子 -->
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

    <!-- 底部的边框线 -->
    <image src="/static/cart_border@2x.png" class="address-border"></image>
  </view>
</template>

<script>
  import { mapState, mapMutations, mapGetters } from 'vuex'

  export default {
    data() {
      return {
        // address: {}
      };
    },
	computed: {
	  ...mapState('m_user', ['address', 'token']),
	  ...mapGetters('m_user', ['addstr'])
	},
    methods: {
      ...mapMutations('m_user', ['updateAddress', 'updateRedirectInfo']),
	  // 选择收货地址
      async chooseAddress() {
		// 1. 判断是否登录
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
						this.updateRedirectInfo({
							openType: 'switchTab',
							from: '/pages/cart/cart' // 地址组件通常在购物车页面
						})
					}
				})
			}, 1500)
			return
		}

		// 跳转到自定义地址列表页面，而不是直接调起原生接口
		uni.navigateTo({
			url: '/subpkg/address-list/address-list'
		})
      },
      // 让用户重新授权
      // async reAuth() {
      //   const [err2, confirmResult] = await uni.showModal({
      //     content: '检测到您没打开地址权限，是否去设置打开？',
      //     confirmText: '确认',
      //     cancelText: '取消'
      //   })
      //   if (err2) return
      //   console.log(confirmResult)
      //   if (confirmResult.cancel) return uni.$showMsg('您取消了地址授权！')
      //   if (confirmResult.confirm) return uni.openSetting({
      //     success: (settingResult) => {
      //       if (!settingResult.authSetting['scope.address']) return uni.$showMsg('您取消了授权！')
      //       if (settingResult.authSetting['scope.address']) return uni.$showMsg('授权成功！请选择地址')
      //     }
      //   })
      // }
    },
  }
</script>

<style lang="scss">
  .my-address {
	padding: $space-2;
	margin-bottom: $space-2;
	overflow: hidden;
  }

  .address-border {
    display: block;
    width: 100%;
    height: 5px;
  }

  .address-choose-box {
    height: 140rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .address-info-box {
    font-size: $font-sm;
    height: 140rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 $space-1;

    .row1 {
      display: flex;
      justify-content: space-between;

      .row1-right {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .row2 {
      display: flex;
      align-items: center;
        margin-top: $space-2;

      .row2-left {
        white-space: nowrap;
      }
    }
  }
</style>
