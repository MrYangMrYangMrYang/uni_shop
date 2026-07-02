module.exports = {
	root: true,

	env: {
		browser: true,
		es2021: true,
		node: true
	},

	// uni-app 项目全局变量（uni / wx / getCurrentPages 等），避免 no-undef 误报
	globals: {
		uni: 'readonly',
		wx: 'readonly',
		getCurrentPages: 'readonly',
		getApp: 'readonly',
		App: 'readonly',
		Page: 'readonly',
		Component: 'readonly'
	},

	extends: ['eslint:recommended', 'plugin:vue/essential', 'plugin:prettier/recommended'],

	parserOptions: {
		ecmaVersion: 2021,
		sourceType: 'module',
		parser: '@babel/eslint-parser',
		requireConfigFile: false
	},

	plugins: ['vue', 'prettier', 'uni-conditional'],

	rules: {
		// ============ Prettier 集成 ============
		'prettier/prettier': 'warn',

		// ============ Vue 规则 ============
		'vue/multi-word-component-names': 'off', // uni-app 单字段组件名常见（如 cart.vue）
		'vue/no-v-html': 'off',
		'vue/require-default-prop': 'off', // props 默认值可选
		'vue/attribute-hyphenation': 'off', // uni-app 部分属性必须驼峰

		// ============ JS 规则 ============
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
		'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
		'no-empty': ['error', { allowEmptyCatch: true }],
		'prefer-const': 'warn',
		'no-var': 'error',
		eqeqeq: ['warn', 'smart'],

		// 允许 async 函数中没有 await（项目里用于标记异步签名）
		'no-async-promise-executor': 'off'
	},

	overrides: [
		// .js 文件：预处理 uni-app 条件编译指令（移除 VUE3 块、解包 VUE2 块），避免解析器报重复声明
		// 仅对 .js 生效，避免干扰 vue-eslint-parser 对 .vue SFC 的解析
		{
			files: ['*.js'],
			processor: 'uni-conditional/vue2'
		},
		// uni-ui 第三方组件不校验
		{
			files: ['components/uni-*/**/*.js', 'components/uni-*/**/*.vue'],
			rules: {
				'no-console': 'off',
				'no-unused-vars': 'off',
				'prettier/prettier': 'off'
			}
		},
		// 测试文件
		{
			files: ['**/tests/unit/**/*.js', '**/*.spec.js', '**/*.test.js'],
			env: { jest: true, node: true }
		},
		// 配置文件
		{
			files: ['*.config.js', '.*.js'],
			env: { node: true }
		}
	]
};
