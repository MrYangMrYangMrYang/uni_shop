/**
 * 收货地址列表页面
 * 职责：
 * 1. 展示用户已保存的所有收货地址
 * 2. 支持地址的选择、编辑、新增
 * 3. 提供从微信一键导入地址的功能
 */
<template>
	<view class="address-list-container">
		<!-- 地址列表滚动区域 -->
		<scroll-view scroll-y="true" class="address-scroll">
			<!-- 循环渲染地址项：支持点击选择 -->
			<view class="address-item u-card--shadow" v-for="(item, i) in sortedAddressList" :key="i" @click="onSelectAddress(item)">
				<view class="item-left">
					<!-- 用户基本信息：姓名、电话、默认标签 -->
					<view class="user-info">
						<text class="name">{{item.userName}}</text>
						<text class="phone">{{item.telNumber}}</text>
						<text class="tag" v-if="item.isDefault">默认</text>
					</view>
					<!-- 详细地址展示 -->
					<view class="address-detail">
						{{item.provinceName}}{{item.cityName}}{{item.countyName}}{{item.detailInfo}}
					</view>
				</view>
				<!-- 右侧编辑按钮：阻止冒泡，避免触发选择地址 -->
				<view class="item-right" @click.stop="onEditAddress(item)">
					<uni-icons type="compose" size="20" color="#909399"></uni-icons>
				</view>
			</view>
			
			<!-- 无数据时的缺省提示 -->
			<view class="empty-box" v-if="addressList.length === 0">
				<image src="https://img01.yzcdn.cn/vant/empty-image-default.png" class="empty-img"></image>
				<text>您还没有收货地址，快去添加吧</text>
			</view>
		</scroll-view>

		<!-- 底部固定操作按钮 -->
		<view class="footer-box">
			<!-- 手动新增按钮 -->
			<button class="add-btn" @click="onAddNewAddress">新增收货地址</button>
			<!-- 微信导入按钮：调用微信原生能力 -->
			<button class="wx-btn" @click="onImportWxAddress">从微信导入</button>
		</view>
	</view>
</template>

<script>
	import { mapState, mapMutations } from 'vuex'

	export default {
		data() {
			return {};
		},
		computed: {
			// 从 m_user 模块映射地址列表
			...mapState('m_user', ['addressList']),
			
			/**
			 * 排序后的地址列表
			 * 业务规则：默认地址必须排在列表第一位，其余按原序排列
			 * @returns {Array} 排序后的地址数组
			 */
			sortedAddressList() {
				return [...this.addressList].sort((a, b) => {
					if (a.isDefault && !b.isDefault) return -1
					if (!a.isDefault && b.isDefault) return 1
					return 0
				})
			}
		},
		methods: {
			// 映射 Vuex 方法用于更新当前选中地址和添加新地址
			...mapMutations('m_user', ['updateAddress', 'addAddress']),
			
			/**
			 * 选择地址事件
			 * @param {Object} item 被点击选中的地址对象
			 */
			onSelectAddress(item) {
				// 1. 更新全局选中的收货地址
				this.updateAddress(item)
				// 2. 返回上一页（通常是订单确认页）
				uni.navigateBack()
			},
			
			/**
			 * 进入地址编辑页面
			 * @param {Object} item 需要编辑的地址对象
			 */
			onEditAddress(item) {
				uni.navigateTo({
					url: '/subpkg/address-edit/address-edit?id=' + item.id
				})
			},
			
			/**
			 * 进入新增地址页面
			 */
			onAddNewAddress() {
				uni.navigateTo({
					url: '/subpkg/address-edit/address-edit'
				})
			},
			
			/**
			 * 从微信导入收货地址
			 * 调用 uni.chooseAddress 唤起微信地址选择界面
			 */
			async onImportWxAddress() {
				// 1. 唤起微信选择收货地址界面
				const [err, succ] = await uni.chooseAddress().catch(err => err)
				
				// 2. 判断是否选择成功
				if (err === null && succ.errMsg === 'chooseAddress:ok') {
					// 3. 将微信返回的数据结构转换为本项目定义的格式
					const newAddr = {
						userName: succ.userName,
						telNumber: succ.telNumber,
						provinceName: succ.provinceName,
						cityName: succ.cityName,
						countyName: succ.countyName,
						detailInfo: succ.detailInfo,
						isDefault: false // 默认不作为默认地址
					}
					// 4. 调用 Vuex 方法保存地址到本地
					this.addAddress(newAddr)
					uni.showToast({ title: '导入成功', icon: 'success' })
				}
			}
		}
	}
</script>

<style lang="scss">
/* 页面主容器样式 */
.address-list-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f4f4f4;

	/* 滚动区域弹性布局 */
	.address-scroll {
		flex: 1;
		padding: 20rpx;
		box-sizing: border-box;

		/* 地址卡片样式 */
		.address-item {
			background-color: #fff;
			border-radius: 16rpx;
			padding: 30rpx;
			margin-bottom: 20rpx;
			display: flex;
			align-items: center;

			.item-left {
				flex: 1;

				.user-info {
					margin-bottom: 10rpx;
					display: flex;
					align-items: center;

					.name {
						font-size: 32rpx;
						font-weight: bold;
						margin-right: 20rpx;
					}

					.phone {
						font-size: 28rpx;
						color: #666;
					}

					/* 默认地址标签样式 */
					.tag {
						font-size: 20rpx;
						color: $color-primary;
						border: 1px solid $color-primary;
						padding: 0 10rpx;
						border-radius: 6rpx;
						margin-left: 20rpx;
					}
				}

				.address-detail {
					font-size: 26rpx;
					color: #333;
					line-height: 1.4;
				}
			}

			/* 右侧编辑区域边框装饰 */
			.item-right {
				padding-left: 30rpx;
				border-left: 1px solid #eee;
			}
		}
	}

	/* 空状态展示样式 */
	.empty-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 200rpx;
		color: #999;
		font-size: 28rpx;

		.empty-img {
			width: 320rpx;
			height: 320rpx;
			margin-bottom: 20rpx;
		}
	}

	/* 底部固定操作区域样式 */
	.footer-box {
		padding: 20rpx 40rpx;
		/* 兼容刘海屏安全距离 */
		padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		background-color: #fff;
		display: flex;
		gap: 20rpx;

		.add-btn, .wx-btn {
			flex: 1;
			height: 80rpx;
			line-height: 80rpx;
			border-radius: 40rpx;
			font-size: 28rpx;
			&::after { border: none; }
		}

		.add-btn {
			background-color: $color-primary;
			color: #fff;
		}

		.wx-btn {
			background-color: #07c160;
			color: #fff;
		}
	}
}
</style>
