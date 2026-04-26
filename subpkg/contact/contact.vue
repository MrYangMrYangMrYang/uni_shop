/**
 * 客服联系页面
 * 作用：提供用户与平台客服的在线聊天界面，支持自动回复模拟
 */
<template>
	<view class="contact-container">
		<!-- 聊天内容区域：使用 scroll-view 实现自动滚动 -->
		<scroll-view class="chat-list" scroll-y="true" :scroll-top="scrollTop">
			<!-- 遍历聊天记录 -->
			<view class="chat-item" v-for="(item, index) in chatList" :key="index" :class="item.type">
				<!-- 客服头像 -->
				<image v-if="item.type === 'service'" src="https://img0.baidu.com/it/u=3564647341,2001353523&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500" class="avatar"></image>
				<!-- 消息气泡 -->
				<view class="message-box">
					<text class="message">{{item.content}}</text>
				</view>
				<!-- 用户头像：从 Vuex 中获取 -->
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
				// 聊天记录列表
				chatList: [
					{ type: 'service', content: '您好！Sunny优购客服为您服务。请问有什么可以帮您的？' }
				],
				// 输入框内容
				inputMsg: '',
				// 滚动条位置
				scrollTop: 0
			};
		},
		computed: {
			// 获取用户信息，用于展示头像
			...mapState('m_user', ['userinfo'])
		},
		methods: {
			/**
			 * 发送消息
			 * 包含：用户消息入队 -> 清空输入框 -> 模拟客服自动回复 -> 滚动到底部
			 */
			sendMsg() {
				if (!this.inputMsg.trim()) return
				
				// 1. 添加用户发送的消息
				this.chatList.push({
					type: 'user',
					content: this.inputMsg
				})
				
				const tempMsg = this.inputMsg
				this.inputMsg = ''
				
				// 2. 模拟客服自动回复（1秒延迟）
				setTimeout(() => {
					this.chatList.push({
						type: 'service',
						content: `收到您的咨询：“${tempMsg}”。我们的客服人员会尽快给您回复，请稍等。`
					})
					// 3. 回复后再次滚动到底部
					this.scrollToBottom()
				}, 1000)
				
				// 4. 用户发送后立即滚动到底部
				this.scrollToBottom()
			},
			/**
			 * 滚动聊天列表到底部
			 * 作用：确保最新消息始终可见
			 */
			scrollToBottom() {
				this.$nextTick(() => {
					// 设置一个足够大的值，确保滚动到最底部
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

	/* 聊天列表区域 */
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

			/* 客服消息样式：左侧对齐，白色背景 */
			&.service {
				.message-box {
					background-color: #fff;
					color: #333;
				}
			}

			/* 用户消息样式：右侧对齐，主题色背景 */
			&.user {
				justify-content: flex-end;
				.message-box {
					background-color: #C00000;
					color: #fff;
				}
			}
		}
	}

	/* 底部输入框区域 */
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
