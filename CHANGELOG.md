# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-06

### Added

- 首页：轮播图、分类导航、楼层推荐
- 分类页：左侧一级 + 右侧二三级联动
- 商品搜索：实时联想、热搜推荐、历史记录（上限20条 + 二次清空确认）
- 商品列表：瀑布流布局、分页加载、综合/销量/价格排序
- 商品详情：轮播图预览、富文本详情
- 购物车：增删改查、全选反选、侧滑删除、双页一致性
- 地址管理：新增/编辑/删除、省市区三级联动、微信导入、默认地址排他
- 订单系统：立即购买、购物车结算、订单列表分状态、支付倒计时
- 在线客服：模拟自动回复
- 登录系统：微信授权登录、Token 持久化、登录守卫
- 状态管理：Vuex 模块化 + 自研持久化插件
- 网络层：@escook/request-miniprogram + 401 拦截 + 错误码映射
- 骨架屏：home/cate/goods_list/goods_detail 首屏骨架
- 表单校验：地址实时校验 + 必填标记 + 保存防抖
- 全局错误捕获：App.onError / onUnhandledRejection / onPageNotFound
- 设计系统：uni.scss 70+ 变量

### Engineering

- ESLint + Prettier + commitlint + husky
- GitHub Actions CI（lint + test 自动执行）
- Vitest 单元测试框架 + uni/wx mock setup
- 环境变量抽离（config/env.js）
- API 接口层抽离（api/home.js / api/goods.js / api/user.js）
