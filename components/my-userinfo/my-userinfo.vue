<!-- 
  个人中心用户信息组件
  展示用户的头像、昵称、订单统计面板以及常用功能列表
-->
<template>
  <view class="my-userinfo-container">
    <!-- 顶部头像和昵称区域：包含背景渐变装饰 -->
    <view class="top-box">
      <image :src="userinfo.avatarUrl" class="avatar"></image>
      <view class="nickname">{{userinfo.nickName}}</view>
    </view>

    <!-- 面板列表区域：浮动在顶部背景之上 -->
    <view class="panel-list">
      <!-- 第1个面板：资产/足迹统计 -->
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

      <!-- 第2个面板：我的订单状态统计 -->
      <view class="panel u-card--shadow">
        <!-- 面板标题：包含“全部订单”跳转链接 -->
        <view class="panel-title">
          <text>我的订单</text>
          <view class="all-order" @click="gotoOrderList(0)">
            <text>全部订单</text>
            <uni-icons type="arrowright" size="14" :color="primaryColor"></uni-icons>
          </view>
        </view>
        <!-- 面板主体：各订单状态入口及数字徽标 -->
        <view class="panel-body">
          <!-- 待付款 -->
          <view class="panel-item u-pressable" @click="gotoOrderList(1)">
            <view class="icon-wrap">
              <image src="/static/my-icons/icon1.png" class="icon"></image>
              <text class="badge" v-if="orderCounts.pendingPayment > 0">{{orderCounts.pendingPayment}}</text>
            </view>
            <text class="txt">待付款</text>
          </view>
          <!-- 待发货 -->
          <view class="panel-item u-pressable" @click="gotoOrderList(2)">
            <view class="icon-wrap">
              <image src="/static/my-icons/icon2.png" class="icon"></image>
              <text class="badge" v-if="orderCounts.toShip > 0">{{orderCounts.toShip}}</text>
            </view>
            <text class="txt">待发货</text>
          </view>
          <!-- 待收货 -->
          <view class="panel-item u-pressable" @click="gotoOrderList(3)">
            <view class="icon-wrap">
              <image src="/static/my-icons/icon3.png" class="icon"></image>
              <text class="badge" v-if="orderCounts.toReceive > 0">{{orderCounts.toReceive}}</text>
            </view>
            <text class="txt">待收货</text>
          </view>
          <!-- 已完成：使用字体图标 -->
          <view class="panel-item u-pressable" @click="gotoOrderList(4)">
            <view class="icon-wrap">
              <uni-icons type="checkbox" size="22" :color="completedIconColor" class="icon-uni"></uni-icons>
              <text class="badge" v-if="orderCounts.completed > 0">{{orderCounts.completed}}</text>
            </view>
            <text class="txt">已完成</text>
          </view>
          <!-- 售后 -->
          <view class="panel-item u-pressable" @click="gotoOrderList(5)">
            <view class="icon-wrap">
              <image src="/static/my-icons/icon4.png" class="icon"></image>
              <text class="badge" v-if="orderCounts.afterSales > 0">{{orderCounts.afterSales}}</text>
            </view>
            <text class="txt">售后</text>
          </view>
        </view>
      </view>

      <!-- 第3个面板：功能列表 -->
      <view class="panel u-card--shadow">
        <!-- 收货地址管理 -->
        <view class="panel-list-item u-pressable" @click="gotoAddressList">
          <view class="item-left">
            <uni-icons type="location-filled" size="18" :color="primaryColor"></uni-icons>
            <text>收货地址</text>
          </view>
          <uni-icons type="arrowright" size="14" :color="mutedColor"></uni-icons>
        </view>
        <!-- 联系客服 -->
        <view class="panel-list-item u-pressable" @click="contactService">
          <view class="item-left">
            <uni-icons type="headphones" size="18" :color="primaryColor"></uni-icons>
            <text>联系客服</text>
          </view>
          <uni-icons type="arrowright" size="14" :color="mutedColor"></uni-icons>
        </view>
        <!-- 退出登录：包含确认弹窗 -->
        <view class="panel-list-item u-pressable" @click="logout">
          <view class="item-left">
            <uni-icons type="clear" size="18" :color="primaryColor"></uni-icons>
            <text>退出登录</text>
          </view>
          <uni-icons type="arrowright" size="14" :color="mutedColor"></uni-icons>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import { mapState, mapMutations, mapGetters } from 'vuex'

  /**
   * 个人中心用户信息组件
   * 负责展示用户基本信息、订单统计、常用功能入口及退出登录逻辑
   */
  export default {
    name: 'my-userinfo',
    data() {
      return {
        // 统一颜色常量，与 uni.scss 保持一致
        primaryColor: '#C00000',
        mutedColor: '#909399',
        completedIconColor: '#f5b6b6'
      };
    },
    computed: {
      // 映射 m_user 模块的状态
      ...mapState('m_user', ['userinfo', 'orderList']),
      // 映射 m_user 模块的 getters，用于获取各订单状态的数量
      ...mapGetters('m_user', ['orderCounts']),
      /**
       * 徽标颜色逻辑
       * 采用折中方案：比主题红柔和，比灰色醒目
       * @returns {String} 徽标背景颜色十六进制值
       */
      badgeColor() {
        return '#ef5350';
      }
    },
    methods: {
      // 映射 m_user 模块的 mutations
      ...mapMutations('m_user', ['updateAddress', 'updateUserInfo', 'updateToken']),
      
      /**
       * 用户退出登录
       * 包含确认提示、loading 动画、成功反馈及数据清理
       * 交互流程：确认弹窗 → loading → 清理数据 → 震动 + Toast → 完成
       * 注意：购物车数据保留在本地存储中，重新登录后可继续使用
       */
      async logout() {
        // 1. 弹出退出登录确认框（带警告样式）
        const [err, succ] = await uni.showModal({
          title: '退出登录',
          content: '确定要退出当前账号吗？',
          confirmText: '确认退出',
          confirmColor: this.primaryColor,
          cancelText: '再想想',
          cancelColor: '#999999'
        }).catch(err => err)

        // 用户点击了取消按钮
        if (!succ || !succ.confirm) return

        // 2. 显示 loading 提示（防止重复点击）
        uni.showLoading({
          title: '正在退出...',
          mask: true
        })

        try {
          // 3. 模拟短暂延迟（提升交互感知，让用户看到 loading）
          await new Promise(resolve => setTimeout(resolve, 500))

          // 4. 清空 Vuex 中的用户数据和 Token
          this.updateAddress({})
          this.updateUserInfo({})
          this.updateToken('')

          // 5. 隐藏 loading
          uni.hideLoading()

          // 6. 显示退出成功提示（使用自定义样式）
          uni.showToast({
            title: '已安全退出',
            icon: 'success',
            duration: 1500,
            mask: true
          })

          // 7. 延迟后可执行额外操作（如跳转首页等）
          // 当前设计：停留在"我的"页面，自动切换到未登录状态

        } catch (error) {
          // 错误处理：隐藏 loading 并提示用户
          uni.hideLoading()
          console.error('退出登录失败:', error)
          
          uni.showToast({
            title: '退出失败，请重试',
            icon: 'none',
            duration: 2000
          })
        }
      },

      /**
       * 跳转到联系客服页面
       */
      contactService() {
        uni.navigateTo({
          url: '/subpkg/contact/contact'
        })
      },

      /**
       * 根据 tab 索引跳转到订单列表页面
       * @param {Number} tab 订单列表的激活标签索引 (0-全部, 1-待付款, 2-待发货, 3-待收货, 4-已完成, 5-售后)
       */
      gotoOrderList(tab) {
        uni.navigateTo({
          url: '/subpkg/order_list/order_list?tab=' + tab
        })
      },

      /**
       * 跳转到收货地址管理页面
       */
      gotoAddressList() {
        uni.navigateTo({
          url: '/subpkg/address-list/address-list'
        })
      }
    }
  }
</script>

<style lang="scss">
  /* 页面容器及整体背景 */
 page, .my-userinfo-container {
    height: 100%;
    background-color: $color-bg-page-strong;

    /* 顶部用户信息盒模型 */
    .top-box {
      height: 400rpx;
      background-color: $color-primary-600;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
	  position: relative;
	  overflow: hidden;

      /* 背景渐变装饰效果 */
	  &::before {
		content: ' ';
		position: absolute;
		inset: -120rpx;
		background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0) 55%);
		pointer-events: none;
	  }

      /* 用户头像样式 */
      .avatar {
        width: 160rpx;
        height: 160rpx;
        border-radius: $radius-pill;
        border: 4rpx solid rgba(255, 255, 255, 0.6);
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
      }

      /* 用户昵称样式 */
      .nickname {
        font-size: $font-lg;
        color: #FFF;
        font-weight: 800;
        margin-top: $space-3;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
      }
    }
  }

  /* 浮动面板列表 */
  .panel-list {
    padding: 0 $space-3;
    position: relative;
    top: -40rpx;

    /* 通用面板容器 */
    .panel {
      background-color: $color-bg;
      border-radius: $radius-lg;
      margin-bottom: $space-3;
      overflow: hidden;

      /* 面板标题栏 */
      .panel-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        line-height: 88rpx;
        padding: 0 $space-3;
        font-size: $font-md;
		font-weight: 800;
		color: $color-text-900;
        border-bottom: 1px solid $color-border-1;

        /* 全部订单跳转入口 */
        .all-order {
          display: flex;
          align-items: center;
          gap: 4rpx;
          font-size: $font-xs;
          color: $color-primary;
          font-weight: normal;
        }
      }

      /* 面板主体内容区域 */
      .panel-body {
        display: flex;
        justify-content: space-around;

        /* 面板内部条目 */
        .panel-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: $space-3 0;

          /* 数字/图标样式 */
          .num {
            font-size: $font-md;
            color: $color-text-900;
            font-weight: bold;
          }

          /* 文字说明样式 */
          .txt {
            font-size: $font-xs;
            color: $color-text-500;
            margin-top: $space-1;
          }

          /* 图标包装容器（含徽标定位） */
          .icon-wrap {
            position: relative;
            
            .icon {
              width: 56rpx;
              height: 56rpx;
            }

            .icon-uni {
              display: block;
            }

            /* 徽标提示样式 */
            .badge {
              position: absolute;
              top: -10rpx;
              right: -6rpx;
              min-width: 30rpx;
              height: 30rpx;
              padding: 0 6rpx;
              background-color: #ef5350; // 折中方案
              color: #ffffff;
              font-size: 20rpx;
              line-height: 30rpx;
              text-align: center;
              border-radius: $radius-pill;
              border: 2rpx solid #ffffff;
              z-index: 10;
              font-weight: 600;
              box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
            }
          }
        }
      }
    }
  }

  /* 列表型面板条目 */
  .panel-list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 90rpx;
    padding: 0 $space-3;
    font-size: $font-md;
    color: $color-text-700;
    border-bottom: 1px solid $color-border-1;

    &:last-child {
      border-bottom: none;
    }

    .item-left {
      display: flex;
      align-items: center;
      gap: $space-2;
    }
  }
</style>
