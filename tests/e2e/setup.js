/**
 * E2E 测试环境配置 — WeChat 小程序自动化测试
 *
 * 前置条件：
 *   1. 微信开发者工具已安装并打开本项目
 *   2. 开发者工具 "设置 → 安全设置 → 服务端口" 已开启（默认端口 9420）
 *   3. npm run dev:mp-weixin 或 HBuilderX 已编译运行
 *
 * 运行方式：
 *   node tests/e2e/setup.js   — 验证环境连接
 *   npm run test:e2e          — 执行完整流程测试
 *
 * 注意：E2E 测试依赖 GUI 工具，无法在 GitHub Actions 等无头 CI 环境运行。
 *       本地开发时手动执行以验证关键业务流程。
 */

const automator = require('miniprogram-automator');

/**
 * 启动或连接小程序实例
 * @returns {Promise<MiniProgram>}
 */
async function launch() {
	const mp = await automator.connect({
		wsEndpoint: 'ws://localhost:9420'
	});
	return mp;
}

/**
 * 从首页开始，启动一个新的小程序实例
 * @returns {Promise<MiniProgram>}
 */
async function launchFresh() {
	const mp = await automator.launch({
		projectPath: __dirname + '/../..'
	});
	return mp;
}

module.exports = { launch, launchFresh };
