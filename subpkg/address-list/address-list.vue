<template>
	<view class="address-list-container">
		<!-- 地址列表 -->
		<scroll-view scroll-y="true" class="address-scroll">
			<view class="address-item u-card--shadow" v-for="(item, i) in sortedAddressList" :key="i" @click="onSelectAddress(item)">
				<view class="item-left">
					<view class="user-info">
						<text class="name">{{item.userName}}</text>
						<text class="phone">{{item.telNumber}}</text>
						<text class="tag" v-if="item.isDefault">默认</text>
					</view>
					<view class="address-detail">
						{{item.provinceName}}{{item.cityName}}{{item.countyName}}{{item.detailInfo}}
					</view>
				</view>
				<view class="item-right" @click.stop="onEditAddress(item)">
					<uni-icons type="compose" size="20" color="#909399"></uni-icons>
				</view>
			</view>
			
			<!-- 空白提示 -->
			<view class="empty-box" v-if="addressList.length === 0">
				<image src="https://img01.yzcdn.cn/vant/empty-image-default.png" class="empty-img"></image>
				<text>您还没有收货地址，快去添加吧</text>
			</view>
		</scroll-view>

		<!-- 底部新增按钮 -->
		<view class="footer-box">
			<button class="add-btn" @click="onAddNewAddress">新增收货地址</button>
			<button class="wx-btn" @click="onImportWxAddress">从微信导入</button>
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
			...mapState('m_user', ['addressList']),
			// 排序后的地址列表，默认地址排在第一位
			sortedAddressList() {
				return [...this.addressList].sort((a, b) => {
					if (a.isDefault && !b.isDefault) return -1
					if (!a.isDefault && b.isDefault) return 1
					return 0
				})
			}
		},
		methods: {
			...mapMutations('m_user', ['updateAddress', 'addAddress']),
			// 选择地址
			onSelectAddress(item) {
				this.updateAddress(item)
				uni.navigateBack()
			},
			// 编辑地址
			onEditAddress(item) {
				uni.navigateTo({
					url: '/subpkg/address-edit/address-edit?id=' + item.id
				})
			},
			// 新增地址
			onAddNewAddress() {
				uni.navigateTo({
					url: '/subpkg/address-edit/address-edit'
				})
			},
			// 从微信导入
			async onImportWxAddress() {
				const [err, succ] = await uni.chooseAddress().catch(err => err)
				if (err === null && succ.errMsg === 'chooseAddress:ok') {
					// 转换格式并保存
					const newAddr = {
						userName: succ.userName,
						telNumber: succ.telNumber,
						provinceName: succ.provinceName,
						cityName: succ.cityName,
						countyName: succ.countyName,
						detailInfo: succ.detailInfo,
						isDefault: false
					}
					this.addAddress(newAddr)
					uni.showToast({ title: '导入成功', icon: 'success' })
				}
			}
		}
	}
</script>

<style lang="scss">
.address-list-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f4f4f4;

	.address-scroll {
		flex: 1;
		padding: 20rpx;
		box-sizing: border-box;

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

					.tag {
						font-size: 20rpx;
						color: #C00000;
						border: 1px solid #C00000;
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

			.item-right {
				padding-left: 30rpx;
				border-left: 1px solid #eee;
			}
		}
	}

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

	.footer-box {
		padding: 20rpx 40rpx;
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
			background-color: #C00000;
			color: #fff;
		}

		.wx-btn {
			background-color: #07c160;
			color: #fff;
		}
	}
}
</style>
