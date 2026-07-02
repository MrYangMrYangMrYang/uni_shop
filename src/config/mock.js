/**
 * Mock / 演示数据配置
 *
 * 将所有前端写死的演示数据集中到此文件，每个数据项说明：
 *   1. 为何需要 mock（后端接口限制 / 非核心演示功能）
 *   2. 生产环境应如何替换
 *
 * 使用方式：在组件中 import { DEMO_XXX } from '@/src/config/mock.js'
 */

// ============ 认证 ============

/**
 * 演示 JWT Token
 *
 * 演示环境（itheima 测试 API）的登录接口不返回真实 Token，
 * 使用此预生成的 Token 模拟已登录的购物体验。
 *
 * 生产环境：从登录接口返回的 Authorization header 或响应体中获取。
 */
export const DEMO_TOKEN =
	'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEyLCJpYXQiOjE1MjU0MDIyMjMsImV4cCI6MTUyNTQ4ODYyM30.g-4GtEQNPwT_Xs0Pq7Lrco_9DfHQQsBiOKZerkO-O-o';

// ============ 用户统计 ============

/**
 * "我的" 页面顶部统计面板数据
 *
 * 演示 API 未提供收藏/足迹等统计接口，使用固定占位数字。
 *
 * 生产环境：从对应 store getter 计算 —
 *   favShops → store.getters['m_user/favShopsCount']
 *   favGoods → store.getters['m_user/favGoodsCount']
 *   watchedGoods → store.getters['m_user/watchedGoodsCount']
 *   history → store.getters['m_user/browseHistoryCount']
 */
export const DEMO_USER_STATS = {
	favShops: 8,
	favGoods: 14,
	watchedGoods: 18,
	history: 84
};

// ============ 商品列表筛选 ============

/**
 * 品牌 / 店铺筛选下拉列表
 *
 * 演示 API（itheima /api/public/v1/goods/search）不提供
 * 品牌或店铺维度的筛选参数，列表始终返回全量商品。
 * goods-list 页面保留筛选 UI 以展示交互能力。
 *
 * 生产环境：从 /api/brands、/api/shops 接口获取真实列表。
 */
export const DEMO_BRAND_LIST = ['Sunny', 'Apple', 'Huawei', 'Xiaomi'];

export const DEMO_SHOP_LIST = ['官方旗舰店', '自营店', '第三方店铺'];

// ============ 热搜词 ============

/**
 * 搜索页热门推荐关键词
 *
 * 演示 API 不提供热搜接口，使用固定列表展示 UI。
 *
 * 生产环境：从 /api/hotwords 或运营配置接口获取。
 */
export const DEMO_HOT_SEARCH = [
	'iPhone 15',
	'华为 Mate 60',
	'小米 14',
	'AirPods Pro',
	'机械键盘',
	'显示器',
	'运动鞋',
	'羽绒服',
	'咖啡机',
	'面膜'
];

// ============ 物流追踪 ============

/**
 * 订单物流详情演示数据
 *
 * 物流查询接口未对接，使用固定时间线展示 UI。
 *
 * 生产环境：从 /api/logistics/{orderId} 获取真实物流轨迹。
 */
export const DEMO_LOGISTICS = [
	{
		status: '您的订单已签收，感谢使用！',
		time: '2023-10-25 14:20:00'
	},
	{
		status: '派送中，派送员：张三 (13800138000)',
		time: '2023-10-25 09:15:00'
	},
	{
		status: '包裹已到达【上海静安分拣中心】',
		time: '2023-10-24 22:10:00'
	},
	{
		status: '包裹已从【杭州萧山集散中心】发出',
		time: '2023-10-24 15:30:00'
	},
	{
		status: '商家已发货，等待快递揽收',
		time: '2023-10-24 10:00:00'
	}
];
