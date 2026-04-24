<template>
	<view class="address-edit-container">
		<view class="form-box u-card--shadow">
			<view class="form-item">
				<text class="label">收货人</text>
				<input class="input" v-model="form.userName" placeholder="请填写收货人姓名" />
			</view>
			<view class="form-item">
				<text class="label">手机号码</text>
				<input class="input" v-model="form.telNumber" type="number" placeholder="请填写手机号码" />
			</view>
			<view class="form-item" @click="onChooseRegion">
				<text class="label">所在地区</text>
				<view class="region-value" :class="{ 'placeholder': !regionStr }">
					{{ regionStr || '请选择所在地区' }}
				</view>
				<uni-icons type="arrowright" size="14" color="#909399"></uni-icons>
			</view>
			<view class="form-item no-border">
				<text class="label">详细地址</text>
				<textarea class="textarea" v-model="form.detailInfo" placeholder="街道、楼牌号等" />
			</view>
		</view>

		<view class="form-box u-card--shadow mt-20">
			<view class="form-item no-border">
				<text class="label">设为默认地址</text>
				<switch :checked="form.isDefault" color="#C00000" @change="onDefaultChange" />
			</view>
		</view>

		<view class="btn-group">
			<button class="save-btn" @click="onSave">保存地址</button>
			<button class="delete-btn" v-if="addressId" @click="onDelete">删除地址</button>
		</view>
	</view>
</template>

<script>
	import { mapState, mapMutations } from 'vuex'

	export default {
		data() {
			return {
				addressId: null,
				form: {
					userName: '',
					telNumber: '',
					provinceName: '',
					cityName: '',
					countyName: '',
					detailInfo: '',
					isDefault: false
				}
			};
		},
		computed: {
			...mapState('m_user', ['addressList']),
			regionStr() {
				if (!this.form.provinceName) return ''
				return `${this.form.provinceName} ${this.form.cityName} ${this.form.countyName}`
			}
		},
		onLoad(options) {
			if (options.id) {
				this.addressId = parseInt(options.id)
				this.initForm()
				uni.setNavigationBarTitle({ title: '编辑收货地址' })
			} else {
				uni.setNavigationBarTitle({ title: '新增收货地址' })
			}
		},
		methods: {
			...mapMutations('m_user', ['addAddress', 'editAddress', 'removeAddress']),
			initForm() {
				const addr = this.addressList.find(x => x.id === this.addressId)
				if (addr) {
					this.form = JSON.parse(JSON.stringify(addr))
				}
			},
			onDefaultChange(e) {
				this.form.isDefault = e.detail.value
			},
			// 模拟地区选择（实际开发中建议使用 picker 组件）
			onChooseRegion() {
				// 这里为了演示，暂时用简单的提示，实际应调用地图选择或地区选择器
				uni.showActionSheet({
					itemList: ['北京 北京市 东城区', '上海 上海市 黄浦区', '广东 广州市 天河区'],
					success: (res) => {
						const regions = ['北京', '上海', '广东']
						const cities = ['北京市', '上海市', '广州市']
						const counties = ['东城区', '黄浦区', '天河区']
						
						this.form.provinceName = regions[res.tapIndex]
						this.form.cityName = cities[res.tapIndex]
						this.form.countyName = counties[res.tapIndex]
					}
				})
			},
			onSave() {
				// 表单校验
				if (!this.form.userName.trim()) return uni.$showMsg('请填写收货人')
				if (!/^1[3-9]\d{9}$/.test(this.form.telNumber)) return uni.$showMsg('手机号格式不正确')
				if (!this.form.provinceName) return uni.$showMsg('请选择所在地区')
				if (!this.form.detailInfo.trim()) return uni.$showMsg('请填写详细地址')

				if (this.form.isDefault) {
					// 如果设为默认，将其他地址设为非默认
					this.addressList.forEach(addr => {
						if (addr.id !== this.addressId) addr.isDefault = false
					})
				}

				if (this.addressId) {
					this.editAddress(this.form)
					uni.$showMsg('修改成功')
				} else {
					this.addAddress(this.form)
					uni.$showMsg('添加成功')
				}

				setTimeout(() => {
					uni.navigateBack()
				}, 1000)
			},
			async onDelete() {
				const [err, succ] = await uni.showModal({
					title: '提示',
					content: '确定要删除该地址吗？'
				})
				if (succ && succ.confirm) {
					this.removeAddress(this.addressId)
					uni.$showMsg('删除成功')
					setTimeout(() => {
						uni.navigateBack()
					}, 1000)
				}
			}
		}
	}
</script>

<style lang="scss">
.address-edit-container {
	padding: 20rpx;
	background-color: #f4f4f4;
	min-height: 100vh;

	.form-box {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 0 30rpx;

		.form-item {
			display: flex;
			align-items: center;
			padding: 30rpx 0;
			border-bottom: 1px solid #eee;

			.label {
				width: 160rpx;
				font-size: 28rpx;
				color: #333;
			}

			.input {
				flex: 1;
				font-size: 28rpx;
			}

			.region-value {
				flex: 1;
				font-size: 28rpx;
				color: #333;
				&.placeholder { color: #999; }
			}

			.textarea {
				flex: 1;
				height: 120rpx;
				font-size: 28rpx;
				padding-top: 6rpx;
			}

			&.no-border { border-bottom: none; }
		}
	}

	.mt-20 { margin-top: 20rpx; }

	.btn-group {
		margin-top: 60rpx;
		padding: 0 20rpx;

		button {
			height: 80rpx;
			line-height: 80rpx;
			border-radius: 40rpx;
			font-size: 30rpx;
			margin-bottom: 30rpx;
			&::after { border: none; }
		}

		.save-btn {
			background-color: #C00000;
			color: #fff;
		}

		.delete-btn {
			background-color: #fff;
			color: #C00000;
			border: 1px solid #C00000;
		}
	}
}
</style>
