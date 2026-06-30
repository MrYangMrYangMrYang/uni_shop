<!--
  地址列表页面
-->
<template>
	<view class="address-list-container">
		<scroll-view class="address-scroll" scroll-y="true" v-if="addressList.length > 0">
			<view class="address-item u-card--shadow" v-for="(item, i) in addressList" :key="i">
				<view class="item-left" @click="selectAddress(item)">
					<view class="user-info">
						<text class="name">{{ item.userName }}</text>
						<text class="phone">{{ item.telNumber }}</text>
						<text class="tag" v-if="item.isDefault">默认</text>
					</view>
					<view class="address-detail"
						>{{ item.provinceName }} {{ item.cityName }} {{ item.countyName }} {{ item.detailInfo }}</view
					>
				</view>
				<view class="item-right u-pressable" @click="editAddress(item)">
					<uni-icons type="compose" size="18" :color="primaryColor"></uni-icons>
				</view>
			</view>
		</scroll-view>

		<view v-else class="empty-wrapper">
			<u-empty mode="address" button-text="添加地址" @action="goAddAddress" />
		</view>

		<view class="footer-box">
			<button class="add-btn" @click="goAddAddress">新增地址</button>
			<button class="wx-btn" @click="onWxImport">微信导入</button>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex';
import UEmpty from '@/components/u-empty/u-empty.vue';

export default {
	components: { 'u-empty': UEmpty },
	data() {
		return { primaryColor: '#C00000' };
	},
	computed: {
		...mapState('m_user', ['addressList'])
	},
	methods: {
		selectAddress(item) {
			this.$store.commit('m_user/updateAddress', item);
			uni.navigateBack();
		},
		editAddress(item) {
			uni.navigateTo({ url: '/subpkg/address-edit/address-edit?id=' + item.id });
		},
		goAddAddress() {
			uni.navigateTo({ url: '/subpkg/address-edit/address-edit' });
		},
		// ── 微信导入 ──
		onWxImport() {
			const vm = this;
			uni.chooseAddress({
				success(res) {
					if (!res.userName) return;
					vm.$store.commit('m_user/addAddress', {
						userName: res.userName,
						telNumber: res.telNumber,
						provinceName: res.provinceName,
						cityName: res.cityName,
						countyName: res.countyName,
						detailInfo: res.detailInfo,
						isDefault: false
					});
					uni.showToast({ title: '已导入', icon: 'success' });
				},
				fail() {}
			});
		}
	}
};
</script>

<style lang="scss">
.address-list-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: $color-bg-base;

	.address-scroll {
		flex: 1;
		padding: $space-2;
		box-sizing: border-box;

		.address-item {
			background-color: $color-bg;
			border-radius: $radius-lg;
			padding: $space-3;
			margin-bottom: $space-2;
			display: flex;
			align-items: center;

			.item-left {
				flex: 1;
				.user-info {
					margin-bottom: $space-1;
					display: flex;
					align-items: center;
					.name {
						font-size: $font-lg;
						font-weight: bold;
						margin-right: $space-2;
					}
					.phone {
						font-size: $font-md;
						color: $color-text-secondary;
					}
					.tag {
						font-size: $font-xs;
						color: $color-primary;
						border: 1px solid $color-primary;
						padding: 0 10rpx;
						border-radius: $radius-sm;
						margin-left: $space-2;
					}
				}
				.address-detail {
					font-size: $font-sm;
					color: $color-text;
					line-height: 1.4;
				}
			}

			.item-right {
				padding-left: $space-3;
				border-left: 1px solid $color-border;
			}
		}
	}

	.empty-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.footer-box {
		padding: $space-2 $space-4;
		background-color: $color-bg;
		display: flex;
		gap: $space-2;

		.add-btn,
		.wx-btn {
			flex: 1;
			height: 80rpx;
			line-height: 80rpx;
			border-radius: 40rpx;
			font-size: $font-md;
			&::after {
				border: none;
			}
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
