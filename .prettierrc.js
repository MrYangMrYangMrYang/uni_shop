module.exports = {
	// 一行最多 120 字符
	printWidth: 120,

	// 缩进 1 个 tab（与项目现有代码风格一致）
	useTabs: true,
	tabWidth: 2,

	// 语句末尾加分号
	semi: true,

	// 使用单引号
	singleQuote: true,

	// 对象字面量属性名仅在需要时加引号
	quoteProps: 'as-needed',

	// JSX 不使用单引号
	jsxSingleQuote: false,

	// 尾随逗号：ES5 兼容（数组和对象尾逗号，函数参数不加）
	trailingComma: 'none',

	// 大括号内首尾加空格：{ foo: bar }
	bracketSpacing: true,

	// 多行 JSX 标签的 > 单独一行
	jsxBracketSameLine: false,

	// 箭头函数单个参数不加括号：(x) => x 改为 x => x
	arrowParens: 'avoid',

	// HTML/Vue 模板空白敏感：css/display
	htmlWhitespaceSensitivity: 'css',

	// 换行符使用 lf
	endOfLine: 'lf'
};
