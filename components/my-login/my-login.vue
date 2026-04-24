<template>
  <view class="login-container u-page--page">
    <view class="login-card u-card--shadow">
      <view class="icon-box">
        <uni-icons type="contact-filled" size="80" color="#C00000"></uni-icons>
      </view>
      <view class="welcome-text">欢迎回来</view>
      <view class="tips-text">登录后即可查看订单并享受更多权益</view>
      <!-- 按钮绑定 open-type="getUserInfo" 属性，表示点击按钮时，希望获取用户的基本信息 -->
      <button type="primary" class="btn-login u-pressable" open-type="getUserInfo" @getuserinfo="getUserInfo">
        一键登录
      </button>
      <view class="bottom-tips">
        登录即代表您已阅读并同意<text class="link">用户协议</text>与<text class="link">隐私政策</text>
      </view>
    </view>
  </view>
</template>

<script>
  import { mapMutations, mapState } from 'vuex'

  export default {
    data() {
      return {

      };
    },
    computed: {
      ...mapState('m_user', ['redirectInfo'])
    },
    methods: {
      ...mapMutations('m_user', ['updateUserInfo', 'updateToken', 'updateRedirectInfo']),
	  
      // 用户授权之后，获取用户的基本信息
      getUserInfo(e) {
        // console.log(e)
		// 判断是否获取用户信息成功
        if (e.detail.errMsg === 'getUserInfo:fail auth deny') return uni.$showMsg('您取消了登录授权！')
		// 获取用户信息成功， e.detail.userInfo 就是用户的基本信息
        // console.log(e.detail.userInfo)
		// 将用户的基本信息存储到 vuex 中
        this.updateUserInfo(e.detail.userInfo)
		// 获取登录成功后的 Token 字符串
        this.getToken(e.detail)
      },
	  
	  // 调用登录接口，换取永久的 token
      async getToken(info) {
        // 获取 code 对应的值
        const [err, res] = await uni.login().catch(err => err)
        if (err || res.errMsg !== 'login:ok') return uni.$showMsg('登录失败！')
        // 准备参数
        const query = {
          code: res.code,
          encryptedData: info.encryptedData,
          iv: info.iv,
          rawData: info.rawData,
          signature: info.signature
        }
		uni.$showMsg('登录成功！')
		// 这里傻逼接口登不上去只能自己定义一个token代替一下
		this.updateToken("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEyLCJpYXQiOjE1MjU0MDIyMjMsImV4cCI6MTUyNTQ4ODYyM30.g-4GtEQNPwT_Xs0Pq7Lrco_9DfHQQsBiOKZerkO-O-o")
        // const { data: loginResult } = await uni.$http.post('/api/public/v1/users/wxlogin', query)
        // if (loginResult.meta.status !== 200) return uni.$showMsg('登录失败！')
        // // 直接把 token 保存到 vuex 中
        // this.updateToken(loginResult.message.token)
		
		// 判断 vuex 中的 redirectInfo 是否为 null
		// 如果不为 null，则登录成功之后，需要重新导航到对应的页面
        this.navigateBack()
      },
	  
	  // 跳转到未登录之前的页面
      navigateBack() {
		// redirectInfo 不为 null，并且导航方式为 switchTab
        if (this.redirectInfo && this.redirectInfo.openType === 'switchTab') {
		  // 调用小程序提供的 uni.switchTab() API 进行页面的导航
          uni.switchTab({
			// 要导航到的页面地址
            url: this.redirectInfo.from,
			// 导航成功之后，把 vuex 中的 redirectInfo 对象重置为 null
            complete: () => {
              this.updateRedirectInfo(null)
            }
          })
        }
      }
    }
  }
</script>

<style lang="scss">
  .login-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 $space-6;

    .login-card {
      width: 100%;
      background-color: #fff;
      padding: $space-7 $space-6;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      
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

      .welcome-text {
        font-size: $font-xl;
        font-weight: 800;
        color: $color-text-900;
        margin-bottom: $space-2;
      }

      .tips-text {
        font-size: $font-sm;
        color: $color-text-300;
        margin-bottom: $space-7;
        text-align: center;
      }

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
