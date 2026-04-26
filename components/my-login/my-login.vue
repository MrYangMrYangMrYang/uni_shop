<!-- 
  用户登录组件
  用于未登录状态下引导用户进行微信一键登录
-->
<template>
  <view class="login-container u-page--page">
    <!-- 登录卡片 -->
    <view class="login-card u-card--shadow">
      <!-- 顶部图标 -->
      <view class="icon-box">
        <uni-icons type="contact-filled" size="80" color="#C00000"></uni-icons>
      </view>
      <!-- 欢迎语 -->
      <view class="welcome-text">欢迎回来</view>
      <view class="tips-text">登录后即可查看订单并享受更多权益</view>
      
      <!-- 一键登录按钮：利用微信 open-type="getUserInfo" 获取用户信息 -->
      <button type="primary" class="btn-login u-pressable" open-type="getUserInfo" @getuserinfo="getUserInfo">
        一键登录
      </button>

      <!-- 底部协议提示 -->
      <view class="bottom-tips">
        登录即代表您已阅读并同意<text class="link">用户协议</text>与<text class="link">隐私政策</text>
      </view>
    </view>
  </view>
</template>

<script>
  import { mapMutations, mapState } from 'vuex'

  /**
   * 用户登录组件
   * 负责微信一键登录授权、Token 换取以及登录成功后的页面回跳逻辑
   */
  export default {
    name: 'my-login',
    data() {
      return {};
    },
    computed: {
      // 映射重定向信息，用于登录后跳转回原来的页面
      ...mapState('m_user', ['redirectInfo'])
    },
    methods: {
      ...mapMutations('m_user', ['updateUserInfo', 'updateToken', 'updateRedirectInfo']),
	  
      /**
       * 获取微信用户信息的回调（由 button 的 open-type="getUserInfo" 触发）
       * @param {Object} e 微信返回的授权结果对象
       */
      getUserInfo(e) {
        // 判断是否授权成功
        if (e.detail.errMsg === 'getUserInfo:fail auth deny') return uni.$showMsg('您取消了登录授权！')
        
        // 1. 将获取到的用户信息保存到 Vuex 中进行持久化存储
        this.updateUserInfo(e.detail.userInfo)
        // 2. 调用换取 Token 的方法
        this.getToken(e.detail)
      },
	  
	  /**
       * 调用后端接口，根据微信登录 code 和用户信息换取永久 Token
       * @param {Object} info 包含加密数据、偏移量、原始数据及签名的对象
       */
      async getToken(info) {
        // 1. 调用 uni.login 获取微信登录必需的 code
        const [err, res] = await uni.login().catch(err => err)
        if (err || res.errMsg !== 'login:ok') return uni.$showMsg('登录失败！')
        
        // 2. 准备接口请求参数
        const query = {
          code: res.code,
          encryptedData: info.encryptedData,
          iv: info.iv,
          rawData: info.rawData,
          signature: info.signature
        }

        // 提示用户登录成功
		uni.$showMsg('登录成功！')
        
		// 3. 模拟 Token 存储
		// 注意：由于演示环境接口限制，此处使用了硬编码的测试 Token。实际开发应使用请求返回的数据。
		this.updateToken("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEyLCJpYXQiOjE1MjU0MDIyMjMsImV4cCI6MTUyNTQ4ODYyM30.g-4GtEQNPwT_Xs0Pq7Lrco_9DfHQQsBiOKZerkO-O-o")
        
        // 4. 执行登录成功后的页面回跳
        this.navigateBack()
      },
	  
	  /**
       * 登录成功后的回跳逻辑
       * 如果存在重定向信息（redirectInfo），则根据其指定的路径和打开方式进行跳转
       */
      navigateBack() {
        // 判断是否有来源页面信息
        if (this.redirectInfo && this.redirectInfo.openType === 'switchTab') {
          uni.switchTab({
            url: this.redirectInfo.from,
            complete: () => {
              // 跳转完成后，清空 Vuex 中的重定向信息，防止下次登录冲突
              this.updateRedirectInfo(null)
            }
          })
        }
      }
    }
  }
</script>

<style lang="scss">
  /* 登录页面容器：全屏居中 */
  .login-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 $space-6;

    /* 登录白底卡片 */
    .login-card {
      width: 100%;
      background-color: #fff;
      padding: $space-7 $space-6;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      
      /* 顶部图标容器 */
      .icon-box {
        width: 160rpx;
        height: 160rpx;
        background-color: $color-primary-light;
        border-radius: $radius-pill;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: $space-4;
      }

      /* 欢迎主标题 */
      .welcome-text {
        font-size: $font-xl;
        font-weight: 800;
        color: $color-text-900;
        margin-bottom: $space-2;
      }

      /* 副标题/提示语 */
      .tips-text {
        font-size: $font-sm;
        color: $color-text-300;
        margin-bottom: $space-7;
        text-align: center;
      }

      /* 登录按钮样式 */
      .btn-login {
        width: 100%;
        height: 88rpx;
        line-height: 88rpx;
        border-radius: $radius-pill;
        background-color: $color-primary-600;
        font-size: $font-md;
        font-weight: 600;
        box-shadow: 0 12rpx 30rpx rgba(192, 0, 0, 0.2);
        border: none;
        margin-bottom: $space-6;
      }

      /* 底部协议文本 */
      .bottom-tips {
        font-size: $font-xs;
        color: $color-text-300;
        text-align: center;
        
        .link {
          color: $color-primary-600;
          margin: 0 4rpx;
        }
      }
    }
  }
</style>
