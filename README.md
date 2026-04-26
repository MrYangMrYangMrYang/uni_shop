# ☀️ Sunny优购 (Sunny Yougou)

[![Uni-app](https://img.shields.io/badge/Framework-Uni--app-green.svg)](https://uniapp.dcloud.io/)
[![Vue.js](https://img.shields.io/badge/Library-Vue.js%202.x-brightgreen.svg)](https://vuejs.org/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

`Sunny优购` 是一款基于 **Uni-app** 框架开发的移动端电商微信小程序。项目采用经典的电商布局，实现了从商品浏览、搜索、分类到购物车、收货地址管理、订单支付及在线客服的完整购物流程。

---

## 🚀 项目特性

- **跨平台兼容**：基于 Uni-app 开发，可编译至微信小程序、H5、App 等多个平台。
- **分包加载优化**：核心 TabBar 页面位于主包，搜索、详情、订单等功能模块位于 `subpkg` 分包，显著提升首屏加载速度。
- **高性能交互**：
  - **瀑布流布局**：商品列表采用左右双列瀑布流展示，视觉体验更佳。
  - **二级联动**：分类页面实现左侧导航与右侧内容的流畅联动。
  - **吸顶效果**：搜索框在首页及搜索页支持粘性定位。
- **状态一致性**：通过 **Vuex** 实现购物车状态、用户信息、收货地址的全局共享与持久化存储。
- **微信深度集成**：
  - 支持 **微信一键登录**（Token 机制）。
  - 对接 **微信原生收货地址** 接口。
  - 模拟 **微信支付** 完整流程。
  - 内置 **在线客服** 聊天系统。

---

## 🛠️ 技术栈

- **核心框架**：[Uni-app](https://uniapp.dcloud.io/) (Vue.js 2.x)
- **网络请求**：[@escook/request-miniprogram](https://www.npmjs.com/package/@escook/request-miniprogram) (支持请求/响应拦截器)
- **状态管理**：Vuex (模块化：m_cart, m_user)
- **样式预处理**：SCSS (Sass)
- **UI 组件库**：uni-ui & 高度定制的业务组件

---

## 📦 核心功能模块

### 1. 首页 (Home)
- **动态运营**：轮播图、分类导航入口。
- **楼层推荐**：精选商品分模块展示。

### 2. 商品分类 (Category)
- **高效筛选**：左右联动导航，支持点击定位。

### 3. 搜索系统 (Search)
- **实时建议**：输入关键词实时联想（防抖处理）。
- **足迹管理**：本地存储搜索历史，支持一键清空。

### 4. 购物流程 (Shop Flow)
- **商品详情**：富文本渲染详情、图片大图预览、多规格下单。
- **购物车**：滑动删除（uni-swipe-action）、数量调整、选中计算、TabBar 实时徽标同步。
- **地址系统**：支持手动编辑与微信导入收货地址。
- **订单系统**：确认下单、订单列表分页、订单状态流转（待付款/待发货等）。

### 5. 在线客服 (Contact)
- **即时通讯**：模拟客服自动回复，提供更贴心的购物导购体验。

---

## 📂 目录结构

```text
uni_shop/
├── components/          # 业务自定义组件 (my-address, my-goods, my-login 等)
├── mixins/              # 逻辑混入 (tabbar-badge 全局购物车角标)
├── pages/               # 主包 TabBar 页面 (home, cate, cart, my)
├── subpkg/              # 功能分包 (search, goods_detail, goods_list, order, contact 等)
├── store/               # Vuex 状态管理模块
├── static/              # 静态资源 (图标、图片)
├── App.vue              # 全局生命周期及样式入口
├── main.js              # 全局配置 (拦截器、全局工具方法)
└── pages.json           # 页面路由及分包配置
```

---

## 🏃 快速开始

1. **安装依赖**
   ```bash
   npm install
   ```

2. **运行项目**
   - 使用 **HBuilderX** 打开项目。
   - 配置微信开发者工具路径。
   - 点击 `运行` -> `运行到小程序模拟器` -> `微信开发者工具`。
   - *注意：请在微信开发者工具中开启“不校验合法域名”。*

---

## 📝 开源协议

本项目遵循 [ISC License](https://opensource.org/licenses/ISC) 协议。
