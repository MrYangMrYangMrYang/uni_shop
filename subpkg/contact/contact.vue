<!--
  客服联系页面
  提供用户与平台客服的在线聊天界面，支持自动回复模拟
-->
<template>
	<view class="contact-container">
		<!-- 聊天内容区域 -->
		<scroll-view class="chat-list" scroll-y="true" :scroll-top="scrollTop">
			<view class="chat-item" v-for="(item, index) in chatList" :key="index" :class="item.type">
				<image v-if="item.type === 'service'" src="/static/cart_empty@2x.png" class="avatar"></image>
				<view class="message-box">
					<text class="message">{{ item.content }}</text>
				</view>
				<image v-if="item.type === 'user'" :src="userinfo.avatarUrl" class="avatar"></image>
			</view>
		</scroll-view>

		<!-- 底部输入区域 -->
		<view class="input-box">
			<input type="text" v-model="inputMsg" placeholder="请输入您想咨询的问题..." @confirm="sendMsg" />
			<button class="send-btn" @click="sendMsg">发送</button>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex';

export default {
	data() {
		return {
			chatList: [{ type: 'service', content: '您好！Sunny优购客服为您服务。请问有什么可以帮您的？' }],
			inputMsg: '',
			scrollTop: 0
		};
	},

	beforeDestroy() {
		if (this.__replyTimer) {
			clearTimeout(this.__replyTimer);
			this.__replyTimer = null;
		}
	},

	computed: {
		...mapState('m_user', ['userinfo'])
	},
	methods: {
		sendMsg() {
			if (!this.inputMsg.trim()) return;

			this.chatList.push({
				type: 'user',
				content: this.inputMsg
			});

			const tempMsg = this.inputMsg;
			this.inputMsg = '';

			// 模拟客服自动回复（1 秒延迟）
			this.__replyTimer = setTimeout(() => {
				this.chatList.push({
					type: 'service',
					content: '收到您的咨询："' + tempMsg + '"。我们的客服人员会尽快给您回复，请稍等。'
				});
				this.scrollToBottom();
			}, 1000);

			this.scrollToBottom();
		},
		scrollToBottom() {
			this.$nextTick(() => {
				// 设置一个足够大的值确保滚动到最底部
				this.scrollTop = this.chatList.length * 1000;
			});
		}
	}
};
</script>

<style lang="scss">
.contact-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: $color-bg-base;

	.chat-list {
		flex: 1;
		padding: $space-2;
		box-sizing: border-box;

		.chat-item {
			display: flex;
			margin-bottom: $space-3;
			align-items: flex-start;

			.avatar {
				width: 80rpx;
				height: 80rpx;
				border-radius: $radius-sm;
			}

			.message-box {
				max-width: 70%;
				padding: $space-2;
				border-radius: $radius-sm;
				margin: 0 $space-2;
				position: relative;
				word-break: break-all;

				.message {
					font-size: $font-md;
				}
			}

			&.service {
				.message-box {
					background-color: $color-bg;
					color: $color-text;
				}
			}

			&.user {
				justify-content: flex-end;
				.message-box {
					background-color: $color-primary-600;
					color: $color-white;
				}
			}
		}
	}

	.input-box {
		display: flex;
		align-items: center;
		padding: $space-2;
		background-color: $color-bg;
		border-top: 1px solid $color-border;

		input {
			flex: 1;
			height: 70rpx;
			background-color: $color-bg-base;
			border-radius: 35rpx;
			padding: 0 $space-3;
			font-size: $font-md;
		}

		.send-btn {
			width: 120rpx;
			height: 70rpx;
			line-height: 70rpx;
			background-color: $color-primary-600;
			color: $color-white;
			font-size: $font-md;
			margin-left: $space-2;
			border-radius: 35rpx;
			padding: 0;

			&::after {
				border: none;
			}
		}
	}
}
</style>
