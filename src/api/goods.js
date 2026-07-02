/**
 * 商品相关 API
 */
import { api } from '@/src/utils/request.js';

/**
 * 商品列表搜索
 * @param {object} params { query, cid, pagenum, pagesize }
 */
export function searchGoods(params) {
	return api.get('/api/public/v1/goods/search', params);
}

/**
 * 商品详情
 * @param {string} goods_id
 */
export function getGoodsDetail(goods_id) {
	return api.get('/api/public/v1/goods/detail', { goods_id });
}

/**
 * 搜索建议（实时联想）
 * @param {string} query
 */
export function getSearchSuggest(query) {
	return api.get('/api/public/v1/goods/qsearch', { query });
}

/**
 * 获取全部分类
 */
export function getCategories() {
	return api.get('/api/public/v1/categories');
}
