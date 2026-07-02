/**
 * 环境配置中心
 * 通过 NODE_ENV 区分开发/生产环境，避免在业务代码中硬编码 baseUrl 等环境相关常量
 *
 * 切换环境方式：
 * - HBuilderX 运行时：通过 manifest.json 的 vueRouterMode 或 HBuilderX 内置 NODE_ENV
 * - 命令行：NODE_ENV=production node xxx
 */

const env = process.env.NODE_ENV || 'development';

const configs = {
	development: {
		apiBaseUrl: 'https://api-hmugo-web.itheima.net',
		requestTimeout: 60000,
		enableLog: true,
		enablePerfLog: true
	},
	production: {
		apiBaseUrl: 'https://api-hmugo-web.itheima.net',
		requestTimeout: 60000,
		enableLog: false,
		enablePerfLog: false,
		// 生产环境性能采样率（0-1），仅对采样比例的会话收集指标
		perfSampleRate: 0.1
	}
};

const currentConfig = configs[env] || configs.development;

module.exports = {
	env,
	isDev: env === 'development',
	isProd: env === 'production',
	...currentConfig
};
