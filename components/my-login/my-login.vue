<!--
  用户登录组件
  用于未登录状态下引导用户进行微信一键登录
-->
<template>
	<view class="login-container u-page--page">
		<!-- 登录卡片 -->
		<view class="login-card u-card--shadow">
			<view class="icon-box">
				<uni-icons type="contact-filled" size="80" :color="primaryColor"></uni-icons>
			</view>
			<view class="welcome-text">欢迎回来</view>
			<view class="tips-text">登录后即可查看订单并享受更多权益</view>

			<!-- 一键登录按钮：利用 open-type="getUserInfo" 获取用户信息 -->
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
import { showToast } from '@/src/utils/toast.js';
import { mapMutations, mapState } from 'vuex';
import { DEMO_TOKEN } from '@/src/config/mock.js';

export default {
	name: 'my-login',
	data() {
		return {
			primaryColor: '#C00000' // $color-primary
		};
	},
	computed: {
		...mapState('m_user', ['redirectInfo'])
	},
	methods: {
		...mapMutations('m_user', ['updateUserInfo', 'updateToken', 'updateRedirectInfo']),

		getUserInfo(e) {
			if (e.detail.errMsg === 'getUserInfo:fail auth deny') return showToast('您取消了登录授权！');

			this.updateUserInfo(e.detail.userInfo);
			this.getToken(e.detail);
		},

		async getToken(_info) {
			const [err, res] = await uni.login().catch(err => err);
			if (err || res.errMsg !== 'login:ok') return showToast('登录失败！');

			showToast('登录成功！');

			// 演示 Token，详见 config/mock.js
			this.updateToken(DEMO_TOKEN);

			this.navigateBack();
		},

		// 登录成功后回跳：区分 TabBar 页面 / 非 TabBar 页面的跳转方式
		navigateBack() {
			if (!this.redirectInfo) return;
			const { openType, from } = this.redirectInfo;

			if (openType === 'switchTab') {
				uni.switchTab({
					url: from,
					complete: () => this.updateRedirectInfo(null)
				});
			} else if (openType === 'navigateTo') {
				uni.navigateTo({
					url: from,
					complete: () => this.updateRedirectInfo(null)
				});
			}
		}
	}
};
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
		background-color: $color-white;
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
			box-shadow: 0 12rpx 30rpx $color-primary-shadow;
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
