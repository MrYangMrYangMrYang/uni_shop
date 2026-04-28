# ☀️ Sunny优购 (Sunny Yougou)

[![Uni-app](https://img.shields.io/badge/Framework-Uni--app-green.svg)](https://uniapp.dcloud.io/)
[![Vue.js](https://img.shields.io/badge/Library-Vue.js%202.x-brightgreen.svg)](https://vuejs.org/)
[![Platform](https://img.shields.io/badge/Platform-微信小程序-blue.svg)](https://developers.weixin.qq.com/miniprogram/dev/framework/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

> 一款基于 **Uni-app** 框架开发的移动端电商微信小程序，实现完整的购物流程

---

## 📖 项目简介

`Sunny优购` 是一款功能完整的电商微信小程序，采用经典的电商布局设计。项目实现了从**商品浏览、搜索、分类**到**购物车管理、收货地址管理、订单支付及在线客服**的完整购物流程，为用户提供流畅便捷的移动端购物体验。

### ✨ 核心亮点

- 🚀 **跨平台兼容**：基于 Uni-app 开发，可编译至微信小程序、H5、App 等多个平台
- ⚡ **性能优化**：分包加载策略 + 瀑布流布局 + 吸顶效果，显著提升用户体验
- 🔐 **安全可靠**：Token 机制登录 + 微信原生接口集成
- 🎨 **交互丰富**：二级联动导航、滑动删除、实时搜索建议等

---

## 🚀 项目特性

### 跨平台与性能
- **跨平台兼容**：基于 Uni-app 开发，可编译至微信小程序、H5、App 等多个平台
- **分包加载优化**：核心 TabBar 页面位于主包，搜索、详情、订单等功能模块位于 `subpkg` 分包，显著提升首屏加载速度

### 高性能交互体验
- **瀑布流布局**：商品列表采用左右双列瀑布流展示，视觉体验更佳
- **二级联动**：分类页面实现左侧导航与右侧内容的流畅联动
- **吸顶效果**：搜索框在首页及搜索页支持粘性定位

### 状态管理与数据持久化
- 通过 **Vuex** 实现购物车状态、用户信息、收货地址的全局共享与持久化存储
- 模块化状态管理：`m_cart`（购物车）、`m_user`（用户信息）

### 微信深度集成
- ✅ 支持 **微信一键登录**（Token 机制）
- ✅ 对接 **微信原生收货地址** 接口
- ✅ 模拟 **微信支付** 完整流程
- ✅ 内置 **在线客服** 聊天系统

---

## 🛠️ 技术栈

| 技术 | 版本/说明 | 用途 |
|------|----------|------|
| [Uni-app](https://uniapp.dcloud.io/) | Vue.js 2.x | 核心开发框架 |
| [Vuex](https://vuex.vuejs.org/) | 3.x | 全局状态管理 |
| [@escook/request-miniprogram](https://www.npmjs.com/package/@escook/request-miniprogram) | ^0.2.1 | 网络请求封装（支持拦截器）|
| SCSS (Sass) | - | 样式预处理 |
| uni-ui | - | UI 组件库基础 |

---

## 📦 核心功能模块

### 1️⃣ 首页 (Home)
- **轮播图展示**：动态运营位，支持自动轮播
- **分类导航**：快捷入口直达商品分类
- **楼层推荐**：精选商品分模块展示

### 2️⃣ 商品分类 (Category)
- **左右联动导航**：左侧分类列表 + 右侧商品内容
- **点击定位**：支持快速定位到指定分类

### 3️⃣ 搜索系统 (Search)
- **实时联想**：输入关键词实时显示建议（防抖处理）
- **搜索历史**：本地存储历史记录，支持一键清空
- **热门推荐**：展示热门搜索关键词

### 4️⃣ 购物流程 (Shop Flow)
#### 商品详情页
- 富文本渲染商品详情
- 图片大图预览功能
- 多规格选择下单

#### 购物车
- 左滑删除商品（uni-swipe-action）
- 商品数量调整（uni-number-box）
- 全选/反选计算总价
- TabBar 实时徽标同步

#### 地址管理系统
- 手动编辑收货地址
- 微信导入收货地址（一键获取）

#### 订单系统
- 订单确认与下单
- 订单列表分页加载
- 订单状态流转（待付款/待发货/待收货/已完成）

### 5️⃣ 在线客服 (Contact)
- **即时通讯**：模拟客服自动回复系统
- **智能导购**：提供贴心的购物咨询服务

---

## 📂 目录结构

```text
uni_shop/
├── components/              # 业务自定义组件
│   ├── my-address/         # 收货地址组件
│   ├── my-goods/           # 商品组件
│   ├── my-login/           # 登录组件
│   ├── my-search/          # 搜索组件
│   ├── my-settle/          # 结算组件
│   ├── my-userinfo/        # 用户信息组件
│   ├── uni-goods-nav/      # 商品导航组件
│   ├── uni-icons/          # 图标组件
│   ├── uni-number-box/     # 数字输入框组件
│   ├── uni-search-bar/     # 搜索栏组件
│   ├── uni-swipe-action/   # 滑动操作组件
│   └── uni-tag/            # 标签组件
├── mixins/                  # 逻辑混入
│   └── tabbar-badge.js     # TabBar 购物车角标混入
├── pages/                   # 主包页面（TabBar 页面）
│   ├── home/               # 首页
│   ├── cate/               # 分类页
│   ├── cart/               # 购物车页
│   └── my/                 # 个人中心页
├── subpkg/                  # 分包页面
│   ├── address-edit/       # 编辑地址
│   ├── address-list/       # 地址列表
│   ├── cart/               # 购物车详情
│   ├── contact/            # 在线客服
│   ├── goods_detail/       # 商品详情
│   ├── goods_list/         # 商品列表
│   ├── order/              # 订单确认
│   ├── order_list/         # 订单列表
│   └── search/             # 搜索页
├── store/                   # Vuex 状态管理
│   ├── cart.js             # 购物车状态模块
│   ├── store.js            # Store 入口
│   └── user.js             # 用户状态模块
├── static/                  # 静态资源
│   ├── my-icons/           # 自定义图标
│   └── tab_icons/          # TabBar 图标
├── App.vue                  # 应用入口（全局生命周期 & 样式）
├── main.js                  # 主入口文件（全局配置）
├── pages.json               # 页面路由配置
├── manifest.json            # 应用配置（AppID、权限等）
├── package.json             # 项目依赖配置
└── uni.scss                 # 全局 SCSS 变量
```

---

## 🏃 快速开始

### 环境要求

- **Node.js**: >= 12.0.0
- **HBuilderX**: 最新版本（推荐）
- **微信开发者工具**: 最新版本
- **npm / yarn / pnpm**: 包管理器

### 安装步骤

#### 1. 克隆项目

```bash
# 使用 Git 克隆
git clone git@gitee.com:yangguangbigboy/uni_shop.git

# 进入项目目录
cd uni_shop
```

#### 2. 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm
pnpm install
```

#### 3. 配置开发环境

1. 使用 **HBuilderX** 打开项目文件夹
2. 配置微信开发者工具路径：
   - `工具` -> `设置` -> `运行配置` -> `微信开发者工具路径`
3. 在 `manifest.json` 中配置微信小程序 AppID（如需真机调试）

#### 4. 运行项目

```bash
# 方式一：通过 HBuilderX 运行
# 点击菜单：运行 -> 运行到小程序模拟器 -> 微信开发者工具

# 方式二：通过 CLI 运行（需安装 cli）
# 运行到微信开发者工具
npm run dev:mp-weixin
```

> ⚠️ **注意**：请在微信开发者工具中开启"不校验合法域名、web-view（业务域名）、TLS版本以及 HTTPS 证书"

---

## ⚙️ 项目配置说明

### 微信小程序配置 ([manifest.json](manifest.json))

| 配置项 | 值 | 说明 |
|--------|-----|------|
| appid | wx59a05d819ac54ff8 | 微信小程序 AppID |
| urlCheck | false | 关闭域名校验（开发环境）|
| lazyCodeLoading | requiredComponents | 按需注入组件 |
| requiredPrivateInfos | chooseAddress | 申请收货地址权限 |

### 网络请求超时配置

- request: 60s
- connectSocket: 60s
- uploadFile: 60s
- downloadFile: 60s

---

## 📝 开发指南

### 状态管理 (Vuex)

项目使用 Vuex 进行全局状态管理，主要包含两个模块：

#### 购物车模块 ([store/cart.js](store/cart.js))
- 商品列表管理
- 选中状态控制
- 总价计算
- 本地持久化

#### 用户模块 ([store/user.js](store/user.js))
- Token 存储
- 用户信息管理
- 收货地址管理

### 网络请求封装

使用 `@escook/request-miniprogram` 封装网络请求：

- ✅ 请求拦截器：自动添加 Token
- ✅ 响应拦截器：统一错误处理
- ✅ 请求超时处理

### 自定义组件说明

所有业务组件位于 [components/](components/) 目录，遵循 Uni-app 组件规范：

- **my-***: 业务逻辑组件（登录、地址、结算等）
- **uni-***: 基础UI组件（图标、标签、数字框等）

---

## ❓ 常见问题 (FAQ)

<details>
<summary><b>🔧 如何解决依赖安装失败？</b></summary>

1. 清除缓存后重试：
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. 切换镜像源：
   ```bash
   npm config set registry https://registry.npmmirror.com
   ```

3. 使用其他包管理器（yarn/pnpm）
</details>

<details>
<summary><b>⚠️ 微信开发者工具报错怎么办？</b></summary>

1. **检查 AppID 配置**：确保 `manifest.json` 中的 appid 正确
2. **关闭域名校验**：在微信开发者工具 -> 详情 -> 本地设置中勾选"不校验..."
3. **重新编译**：点击"编译"按钮重新加载项目
4. **清除缓存**：工具 -> 清除全部缓存
</details>

<details>
<summary><b>📱 如何切换到其他平台？</b></summary>

在 HBuilderX 中：
1. 点击 `运行` -> `运行到浏览器` （H5）
2. 或 `发行` -> `原生App-云打包` （App）
3. 详细文档参考：[Uni-app 多端发布指南](https://uniapp.dcloud.io/tutorial/platform)
</details>

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进本项目！

### 提交规范

- feat: 新功能
- fix: 修复问题
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构代码
- test: 测试相关
- chore: 构建/工具相关

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

---

## 📄 开源协议

本项目采用 [ISC License](https://opensource.org/licenses/ISC) 协议开源。

```
Copyright (c) 2024 Sunny优购

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.
```

---

## 🙏 致谢

- [DCloud](https://www.dcloud.io/) - 提供 Uni-app 开发框架
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Escook](https://github.com/escook) - 提供 request-miniprogram 库
- [uni-ui](https://uniapp.dcloud.io/component/uniui/uni-ui.html) - UI 组件库

---

## 📮 联系方式

- 💬 **Issue**: [提交问题](https://gitee.com/yangguangbigboy/uni_shop/issues)
- 📧 **邮箱**: （可添加联系邮箱）
- 🌐 **项目地址**: [Gitee 仓库](https://gitee.com/yangguangbigboy/uni_shop)

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐ Star 支持一下！**

Made with ❤️ by Sunny优购团队

</div>
