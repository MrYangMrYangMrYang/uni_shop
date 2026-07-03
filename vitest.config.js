import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue2';
import path from 'path';

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './')
		}
	},
	test: {
		// 测试文件匹配规则
		include: ['**/tests/unit/**/*.spec.js'],
		// 排除 build 产物和依赖
		exclude: ['node_modules/**', 'dist/**', 'unpackage/**', 'tests/e2e/**'],
		// 全局环境：node（uni-app 业务代码引用了 uni 全局，需在 setup 文件中 mock）
		environment: 'node',
		// 全局 setup 文件（mock uni / wx 等全局 API）
		setupFiles: ['./tests/unit/setup.js'],
		// 覆盖率配置
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			// 扩展覆盖率范围：纳入 store / utils / mixins / api / config
			include: ['src/store/**', 'src/utils/**', 'src/mixins/**', 'src/api/**', 'src/config/**'],
			exclude: [
				'**/*.spec.js',
				'node_modules/**',
				'src/config/mock.js' // 纯静态演示数据，无需测试
			],
			// 覆盖率阈值：低于此值 CI 失败，防止覆盖率退化
			thresholds: {
				lines: 60,
				branches: 50,
				functions: 60,
				statements: 60
			}
		}
	}
});
