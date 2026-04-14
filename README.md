# ☀️ Sunshine优购 (Sunshine Yougou)

[![Uni-app](https://img.shields.io/badge/Framework-Uni--app-green.svg)](https://uniapp.dcloud.io/)
[![Vue.js](https://img.shields.io/badge/Library-Vue.js%202.x-brightgreen.svg)](https://vuejs.org/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

`Sunshine优购` 是一款基于 **Uni-app** 框架开发的移动端电商微信小程序。项目采用经典的电商布局，实现了从商品浏览、搜索、分类到购物车及用户结算的完整购物流程。

---

## 🚀 项目特性

- **跨平台兼容**：利用 Uni-app 的跨端特性，可编译至微信小程序、H5、iOS 及 Android。
- **高性能搜索**：支持搜索历史缓存、实时关键词联想及商品列表分段加载。
- **丝滑交互**：内置多种自定义组件，如收货地址选择、商品卡片、吸顶搜索栏等。
- **状态同步**：通过 Vuex 实现全局购物车状态管理，确保跨页面数据一致性。
- **极致视觉**：采用 SCSS 进行样式编写，主题色明确，响应式布局适配多种机型。

---

## 🛠️ 技术栈

- **核心框架**：[Uni-app](https://uniapp.dcloud.io/) (Vue.js 2.x)
- **网络请求**：[@escook/request-miniprogram](https://www.npmjs.com/package/@escook/request-miniprogram)
- **状态管理**：Vuex
- **样式预处理**：SCSS (Sass)
- **UI 组件库**：uni-ui & 自定义业务组件

---

## 📦 核心功能模块

### 1. 首页 (Home)
- **轮播图**：动态展示热门活动及商品。
- **导航栏**：快速跳转分类页面。
- **楼层展示**：精选商品分模块瀑布流展示。

### 2. 商品分类 (Category)
- **二级联动**：左侧一级分类导航，右侧二级/三级分类商品展示。
- **平滑滚动**：支持点击定位与丝滑滚动体验。

### 3. 搜索系统 (Search)
- **联想搜索**：输入关键字实时获取匹配商品。
- **搜索历史**：本地存储用户的搜索足迹。

### 4. 商品详情 (Goods Detail)
- **图文详情**：展示商品多维信息及参数。
- **一键下单**：加入购物车及立即购买功能。

### 5. 购物车 (Cart)
- **地址管理**：对接微信原生收货地址 API。
- **批量操作**：支持修改数量、删除及全选计算。
- **动态角标**：Tabbar 实时显示购物车商品总数。

### 6. 个人中心 (My)
- **一键登录**：集成微信快捷登录及 Token 验证。
- **个人信息**：展示头像、昵称及订单入口。

---

## 📂 目录结构

```text
uni_shop/
├── components/          # 业务自定义组件
├── pages/               # 主包页面 (TabBar 页面)
├── subpkg/              # 分包页面 (优化启动速度)
├── store/               # Vuex 状态管理
├── static/              # 静态资源 (图标、图片)
├── mixins/              # 逻辑混入
├── App.vue              # 应用入口
├── main.js              # Vue 实例化入口
├── pages.json           # 页面路由及全局配置
└── manifest.json        # 应用配置 (AppID、权限等)
```

---

## 🏃 快速开始

1. **克隆项目**
   ```bash
   git clone git@gitee.com:yangguangbigboy/uni_shop.git
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **运行项目**
   - 使用 **HBuilderX** 打开项目根目录。
   - 点击顶部菜单 `运行` -> `运行到小程序模拟器` -> `微信开发者工具`。
   - *注意：请确保微信开发者工具中已开启服务端口。*

---

## 📝 开源协议

本项目遵循 [ISC License](https://opensource.org/licenses/ISC) 协议。




