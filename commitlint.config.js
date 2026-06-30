module.exports = {
	// 采用 Angular/Conventional Commits 规范
	// 格式：type(scope): subject
	extends: ['@commitlint/config-conventional'],

	rules: {
		// type 枚举（结合项目 README 中的提交规范）
		'type-enum': [
			2,
			'always',
			[
				'feat', // 新功能
				'fix', // 修复 bug
				'docs', // 文档更新
				'style', // 代码格式（不影响功能）
				'refactor', // 重构（既不是新增功能，也不是修复 bug）
				'perf', // 性能优化
				'test', // 测试相关
				'build', // 构建系统或外部依赖变更
				'ci', // CI 配置
				'chore', // 杂项（不修改 src 或测试）
				'revert' // 回滚提交
			]
		],

		// type 不能为空
		'type-empty': [2, 'never'],

		// subject 不能为空
		'subject-empty': [2, 'never'],

		// subject 不强制句号结尾
		'subject-full-stop': [0],

		// subject 不强制小写（中文提交信息友好）
		'subject-case': [0],

		// header 最大长度放宽到 120（中文提交信息字符较长）
		'header-max-length': [2, 'always', 120]
	}
};
