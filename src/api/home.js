/**
 * 首页相关 API
 */
import { api } from '@/src/utils/request.js';

const BASE = '/api/public/v1/home';

/**
 * 获取轮播图列表
 */
export function getSwiperList() {
	return api.get(`${BASE}/swiperdata`);
}

/**
 * 获取分类导航
 */
export function getNavList() {
	return api.get(`${BASE}/catitems`);
}

/**
 * 获取楼层数据
 */
export function getFloorList() {
	return api.get(`${BASE}/floordata`);
}
