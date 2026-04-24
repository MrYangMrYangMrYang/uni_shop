<template>
	<view class="contact-container">
		<!-- 聊天内容区域 -->
		<scroll-view class="chat-list" scroll-y="true" :scroll-top="scrollTop">
			<view class="chat-item" v-for="(item, index) in chatList" :key="index" :class="item.type">
				<image v-if="item.type === 'service'" src="https://img0.baidu.com/it/u=3564647341,2001353523&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500" class="avatar"></image>
				<view class="message-box">
					<text class="message">{{item.content}}</text>
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
	import { mapState } from 'vuex'

	export default {
		data() {
			return {
				chatList: [
					{ type: 'service', content: '您好！Sunny优购客服为您服务。请问有什么可以帮您的？' }
				],
				inputMsg: '',
				scrollTop: 0
			};
		},
		computed: {
			...mapState('m_user', ['userinfo'])
		},
		methods: {
			sendMsg() {
				if (!this.inputMsg.trim()) return
				
				// 添加用户消息
				this.chatList.push({
					type: 'user',
					content: this.inputMsg
				})
				
				const tempMsg = this.inputMsg
				this.inputMsg = ''
				
				// 自动回复
				setTimeout(() => {
					this.chatList.push({
						type: 'service',
						content: `收到您的咨询：“${tempMsg}”。我们的客服人员会尽快给您回复，请稍等。`
					})
					this.scrollToBottom()
				}, 1000)
				
				this.scrollToBottom()
			},
			scrollToBottom() {
				this.$nextTick(() => {
					this.scrollTop = this.chatList.length * 1000
				})
			}
		}
	}
</script>

<style lang="scss">
.contact-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f4f4f4;

	.chat-list {
		flex: 1;
		padding: 20rpx;
		box-sizing: border-box;

		.chat-item {
			display: flex;
			margin-bottom: 30rpx;
			align-items: flex-start;

			.avatar {
				width: 80rpx;
				height: 80rpx;
				border-radius: 10rpx;
			}

			.message-box {
				max-width: 70%;
				padding: 20rpx;
				border-radius: 10rpx;
				margin: 0 20rpx;
				position: relative;
				word-break: break-all;

				.message {
					font-size: 28rpx;
				}
			}

			&.service {
				.message-box {
					background-color: #fff;
					color: #333;
				}
			}

			&.user {
				justify-content: flex-end;
				.message-box {
					background-color: #C00000;
					color: #fff;
				}
			}
		}
	}

	.input-box {
		display: flex;
		align-items: center;
		padding: 20rpx;
		background-color: #fff;
		border-top: 1px solid #ddd;

		input {
			flex: 1;
			height: 70rpx;
			background-color: #f4f4f4;
			border-radius: 35rpx;
			padding: 0 30rpx;
			font-size: 28rpx;
		}

		.send-btn {
			width: 120rpx;
			height: 70rpx;
			line-height: 70rpx;
			background-color: #C00000;
			color: #fff;
			font-size: 28rpx;
			margin-left: 20rpx;
			border-radius: 35rpx;
			padding: 0;
			
			&::after {
				border: none;
			}
		}
	}
}
</style>
