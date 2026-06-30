<!--
  地址编辑/新增页面
  功能：
  1. 新增收货地址或编辑已有地址
  2. 收货人、手机号、地区、详细地址的表单校验（实时 + 保存时）
  3. 默认地址排他处理（设为默认时取消其他地址的默认状态）
  4. 删除地址
  5. 保存防抖
-->
<template>
	<view class="address-edit-container">
		<!-- 地址编辑表单区域 -->
		<view class="form-box u-card--shadow">
			<view class="form-item">
				<text class="label"><text class="required">*</text>收货人</text>
				<input
					class="input"
					v-model="form.userName"
					placeholder="请填写收货人姓名"
					maxlength="20"
					@blur="validateField('userName')"
				/>
			</view>
			<view class="form-item__error" v-if="errors.userName">{{ errors.userName }}</view>

			<view class="form-item">
				<text class="label"><text class="required">*</text>手机号码</text>
				<input
					class="input"
					v-model="form.telNumber"
					type="number"
					placeholder="请填写手机号码"
					maxlength="11"
					@blur="validateField('telNumber')"
				/>
			</view>
			<view class="form-item__error" v-if="errors.telNumber">{{ errors.telNumber }}</view>

			<!-- 省市区三级联动选择器 -->
			<view class="form-item">
				<text class="label"><text class="required">*</text>所在地区</text>
				<picker class="region-picker" mode="region" :value="regionValue" @change="onRegionChange">
					<view class="region-value" :class="{ placeholder: !regionStr }">
						{{ regionStr || '请选择所在地区' }}
					</view>
				</picker>
				<uni-icons type="arrowright" size="14" color="#909399"></uni-icons>
			</view>
			<view class="form-item__error" v-if="errors.region">{{ errors.region }}</view>

			<view class="form-item no-border">
				<text class="label"><text class="required">*</text>详细地址</text>
				<textarea
					class="textarea"
					v-model="form.detailInfo"
					placeholder="街道、楼牌号等"
					maxlength="100"
					@blur="validateField('detailInfo')"
				/>
			</view>
			<view class="form-item__error" v-if="errors.detailInfo">{{ errors.detailInfo }}</view>
		</view>

		<!-- 设置默认地址 -->
		<view class="form-box u-card--shadow mt-20">
			<view class="form-item no-border">
				<text class="label">设为默认地址</text>
				<switch :checked="form.isDefault" color="#C00000" @change="onDefaultChange" />
			</view>
		</view>

		<!-- 底部操作按钮 -->
		<view class="btn-group">
			<button class="save-btn" :disabled="isSaving" @click="onSave">{{ isSaving ? '保存中...' : '保存地址' }}</button>
			<button class="delete-btn" v-if="addressId" @click="onDelete">删除地址</button>
		</view>
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
	data() {
		return {
			// 表单校验错误
			errors: {},
			// 保存防抖
			isSaving: false,
			// 当前编辑的地址 ID，为 null 表示新增模式
			addressId: null,
			form: {
				userName: '',
				telNumber: '',
				provinceName: '',
				cityName: '',
				countyName: '',
				detailInfo: '',
				isDefault: false
			},
			// picker 三列数据（省/市/区）
			// mode="region" 的初始值，编辑时从已有地址回填
			regionValue: []
		};
	},
	computed: {
		...mapState('m_user', ['addressList']),
		regionStr() {
			if (!this.form.provinceName) return '';
			return `${this.form.provinceName} ${this.form.cityName} ${this.form.countyName}`;
		}
	},
	onLoad(options) {
		if (options.id) {
			this.addressId = parseInt(options.id);
			this.initForm();
			uni.setNavigationBarTitle({ title: '编辑收货地址' });
		} else {
			uni.setNavigationBarTitle({ title: '新增收货地址' });
		}
	},
	methods: {
		...mapMutations('m_user', ['addAddress', 'editAddress', 'removeAddress']),

		// 初始化表单：编辑模式从 store 回填数据
		initForm() {
			const addr = this.addressList.find(x => x.id === this.addressId);
			if (addr) {
				this.form = JSON.parse(JSON.stringify(addr));
				// mode="region" 的 value 是字符串数组
				if (addr.provinceName) {
					this.regionValue = [addr.provinceName, addr.cityName, addr.countyName];
				}
			}
		},

		onDefaultChange(e) {
			this.form.isDefault = e.detail.value;
		},

		// 实时字段校验（@blur 触发）
		validateField(field) {
			const value = this.form[field];
			switch (field) {
				case 'userName':
					if (!value || !value.trim()) {
						this.errors.userName = '请填写收货人姓名';
					} else if (value.trim().length < 2) {
						this.errors.userName = '姓名至少2个字符';
					} else {
						delete this.errors.userName;
					}
					break;
				case 'telNumber':
					if (!value) {
						this.errors.telNumber = '请填写手机号码';
					} else if (!/^1[3-9]\d{9}$/.test(value)) {
						this.errors.telNumber = '手机号格式不正确';
					} else {
						delete this.errors.telNumber;
					}
					break;
				case 'detailInfo':
					if (!value || !value.trim()) {
						this.errors.detailInfo = '请填写详细地址';
					} else {
						delete this.errors.detailInfo;
					}
					break;
			}
			this.errors = { ...this.errors };
		},

		// 全字段校验（保存时调用）
		validateAll() {
			this.validateField('userName');
			this.validateField('telNumber');
			if (!this.form.provinceName) {
				this.errors.region = '请选择所在地区';
			} else {
				delete this.errors.region;
			}
			this.validateField('detailInfo');
			this.errors = { ...this.errors };
			return Object.keys(this.errors).length === 0;
		},

		// mode="region"：e.detail.value 直接返回 [省名, 市名, 区名]
		onRegionChange(e) {
			const [province, city, district] = e.detail.value;
			this.form.provinceName = province || '';
			this.form.cityName = city || '';
			this.form.countyName = district || '';
			this.regionValue = [province, city, district];
		},

		onSave() {
			if (this.isSaving) return;
			if (!this.validateAll()) return;
			this.isSaving = true;

			if (this.form.isDefault) {
				this.addressList.forEach(addr => {
					if (addr.id !== this.addressId) addr.isDefault = false;
				});
			}

			if (this.addressId) {
				this.editAddress(this.form);
				uni.$showMsg('修改成功');
			} else {
				this.addAddress(this.form);
				uni.$showMsg('添加成功');
			}

			setTimeout(() => {
				uni.navigateBack();
			}, 1000);
		},

		onDelete() {
			uni.showModal({
				title: '提示',
				content: '确定要删除该地址吗？',
				confirmColor: '#C00000',
				success: res => {
					if (res.confirm) {
						this.removeAddress(this.addressId);
						uni.$showMsg('删除成功');
						setTimeout(() => {
							uni.navigateBack();
						}, 1000);
					}
				}
			});
		}
	}
};
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

				.required {
					color: #c00000;
					margin-right: 4rpx;
				}
			}

			.input {
				flex: 1;
				font-size: 28rpx;
			}

			.region-picker {
				flex: 1;
			}

			.region-value {
				font-size: 28rpx;
				color: #333;
				&.placeholder {
					color: #999;
				}
			}

			.textarea {
				flex: 1;
				height: 120rpx;
				font-size: 28rpx;
				padding-top: 6rpx;
			}

			&.no-border {
				border-bottom: none;
			}
		}

		.form-item__error {
			font-size: 22rpx;
			color: #c00000;
			padding: 6rpx 0 6rpx 160rpx;
		}
	}

	.mt-20 {
		margin-top: 20rpx;
	}

	.btn-group {
		margin-top: 60rpx;
		padding: 0 20rpx;

		button {
			height: 80rpx;
			line-height: 80rpx;
			border-radius: 40rpx;
			font-size: 30rpx;
			margin-bottom: 30rpx;
			&::after {
				border: none;
			}
		}

		.save-btn {
			background-color: #c00000;
			color: #fff;
			&[disabled] {
				opacity: 0.6;
			}
		}

		.delete-btn {
			background-color: #fff;
			color: #c00000;
			border: 1px solid #c00000;
		}
	}
}
</style>
