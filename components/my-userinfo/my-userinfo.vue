<template>
  <view class="my-userinfo-container">
    <!-- 头像和昵称区域 -->
    <view class="top-box">
      <image :src="userinfo.avatarUrl" class="avatar"></image>
      <view class="nickname">{{userinfo.nickName}}</view>
    </view>

    <!-- 面板区域 -->
    <view class="panel-list">
      <!-- 第1个面板 -->
      <view class="panel u-card--shadow">
        <view class="panel-body">
          <view class="panel-item u-pressable">
            <text class="num">8</text>
            <text class="txt">收藏店铺</text>
          </view>
          <view class="panel-item u-pressable">
            <text class="num">14</text>
            <text class="txt">收藏商品</text>
          </view>
          <view class="panel-item u-pressable">
            <text class="num">18</text>
            <text class="txt">关注商品</text>
          </view>
          <view class="panel-item u-pressable">
            <text class="num">84</text>
            <text class="txt">足迹</text>
          </view>
        </view>
      </view>

      <!-- 第2个面板 -->
      <view class="panel u-card--shadow">
        <view class="panel-title">我的订单</view>
        <view class="panel-body">
          <view class="panel-item u-pressable" @click="gotoOrderList(1)">
            <image src="/static/my-icons/icon1.png" class="icon"></image>
            <text class="txt">待付款</text>
          </view>
          <view class="panel-item u-pressable" @click="gotoOrderList(3)">
            <image src="/static/my-icons/icon2.png" class="icon"></image>
            <text class="txt">待收货</text>
          </view>
          <view class="panel-item u-pressable" @click="gotoOrderList(4)">
            <image src="/static/my-icons/icon3.png" class="icon"></image>
            <text class="txt">退款/售后</text>
          </view>
          <view class="panel-item u-pressable" @click="gotoOrderList(0)">
            <image src="/static/my-icons/icon4.png" class="icon"></image>
            <text class="txt">全部订单</text>
          </view>
        </view>
      </view>

      <!-- 第3个面板 -->
      <view class="panel u-card--shadow">
        <view class="panel-list-item u-pressable" @click="gotoAddressList">
          <view class="item-left">
            <uni-icons type="location-filled" size="18" color="#C00000"></uni-icons>
            <text>收货地址</text>
          </view>
          <uni-icons type="arrowright" size="14" color="#909399"></uni-icons>
        </view>
        <view class="panel-list-item u-pressable" @click="contactService">
          <view class="item-left">
            <uni-icons type="headphones" size="18" color="#C00000"></uni-icons>
            <text>联系客服</text>
          </view>
          <uni-icons type="arrowright" size="14" color="#909399"></uni-icons>
        </view>
        <view class="panel-list-item logout-item u-pressable" @click="logout">
          <view class="item-left">
            <uni-icons type="clear" size="18" color="#909399"></uni-icons>
            <text>退出登录</text>
          </view>
          <uni-icons type="arrowright" size="14" color="#909399"></uni-icons>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import { mapState, mapMutations } from 'vuex'

  export default {
    data() {
      return {

      };
    },
    computed: {
      ...mapState('m_user', ['userinfo'])
    },
    methods: {
      ...mapMutations('m_user', ['updateAddress', 'updateUserInfo', 'updateToken']),
      ...mapMutations('m_cart', ['clearCart']),
	  // 用户登出
      async logout() {
        const [err, succ] = await uni.showModal({
          title: '提示',
          content: '确认退出登录吗？'
        }).catch(err => err)

        if (succ && succ.confirm) {
          this.updateAddress({})
          this.updateUserInfo({})
          this.updateToken('')
          // 清空购物车
          this.clearCart()
        }
      },
      // 跳转到联系客服页面
      contactService() {
        uni.navigateTo({
          url: '/subpkg/contact/contact'
        })
      },
      // 跳转到订单列表页面
      gotoOrderList(tab) {
        uni.navigateTo({
          url: '/subpkg/order_list/order_list?tab=' + tab
        })
      },
      // 跳转到地址列表页面
      gotoAddressList() {
        uni.navigateTo({
          url: '/subpkg/address-list/address-list'
        })
      }
    }
  }
</script>

<style lang="scss">
 page, .my-userinfo-container {
    height: 100%;
    background-color: $color-bg-page-strong;

    .top-box {
      height: 400rpx;
      background-color: $color-primary-600;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
	  position: relative;
	  overflow: hidden;

	  &::before {
		content: ' ';
		position: absolute;
		inset: -120rpx;
		background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0) 55%);
		pointer-events: none;
	  }

      .avatar {
        width: 160rpx;
        height: 160rpx;
        border-radius: $radius-pill;
        border: 4rpx solid rgba(255, 255, 255, 0.6);
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
      }

      .nickname {
        font-size: $font-lg;
        color: #FFF;
        font-weight: 800;
        margin-top: $space-3;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
      }
    }
  }

  .panel-list {
    padding: 0 $space-3;
    position: relative;
    top: -40rpx;

    .panel {
      background-color: white;
      border-radius: $radius-lg;
      margin-bottom: $space-3;
      overflow: hidden;

      .panel-title {
        line-height: 88rpx;
        padding: 0 $space-3;
        font-size: $font-md;
		font-weight: 800;
		color: $color-text-900;
        border-bottom: 1px solid $color-border-1;
      }

      .panel-body {
        display: flex;
        justify-content: space-around;

        .panel-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: $space-4 0;
          
          .num {
            font-size: $font-md;
            font-weight: 800;
            color: $color-text-900;
            margin-bottom: 4rpx;
          }

          .txt {
            font-size: $font-xs;
            color: $color-text-500;
          }

          .icon {
            width: 56rpx;
            height: 56rpx;
            margin-bottom: $space-2;
          }
        }
      }
    }
  }

  .panel-list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 $space-3;
    line-height: 100rpx;
    border-bottom: 1px solid $color-border-1;

    &:last-child {
      border-bottom: none;
    }

    .item-left {
      display: flex;
      align-items: center;
      gap: $space-2;
      font-size: $font-md;
      color: $color-text-700;
      font-weight: 500;
    }

    &.logout-item {
      .item-left {
        color: $color-text-300;
      }
    }
  }
</style>
