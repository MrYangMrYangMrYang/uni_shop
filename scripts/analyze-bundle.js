/**
 * 微信小程序包体积分析脚本
 *
 * 递归分析构建产物目录，输出各分包体积占比和最大的文件列表，
 * 并检查微信小程序包体积限制（主包 2MB，单个分包 2MB，总包 20MB）。
 *
 * 用法：
 *   node scripts/analyze-bundle.js [--dir path/to/dist]
 *   npm run analyze:size
 *
 * 默认分析目录：unpackage/dist/build/mp-weixin
 */

const fs = require('fs');
const path = require('path');

// ============ 配置 ============

const args = process.argv.slice(2);
const dirIndex = args.indexOf('--dir');
const TARGET_DIR = dirIndex !== -1 ? args[dirIndex + 1] : path.resolve(__dirname, '../unpackage/dist/build/mp-weixin');

// 微信小程序限制（单位：字节）
const LIMITS = {
	mainPackage: 2 * 1024 * 1024, // 主包 2MB
	subPackage: 2 * 1024 * 1024, // 单个分包 2MB
	total: 20 * 1024 * 1024 // 总包 20MB
};

// ============ 工具函数 ============

function formatSize(bytes) {
	if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
	if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
	return bytes + ' B';
}

function getFileSize(filePath) {
	try {
		return fs.statSync(filePath).size;
	} catch {
		return 0;
	}
}

/**
 * 递归遍历目录，收集文件信息
 * @param {string} dir
 * @param {string} baseDir
 * @returns {{ files: Array<{path: string, size: number}>, dirs: Object<string, number> }}
 */
function walkDir(dir, baseDir = dir) {
	const result = { files: [], dirs: {} };

	if (!fs.existsSync(dir)) return result;

	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			const sub = walkDir(fullPath, baseDir);
			result.files.push(...sub.files);
			// 合并子目录的 dirs
			for (const [k, v] of Object.entries(sub.dirs)) {
				result.dirs[k] = (result.dirs[k] || 0) + v;
			}
			// 计算本目录总大小
			let dirSize = 0;
			for (const f of sub.files) dirSize += f.size;
			const relativePath = path.relative(baseDir, fullPath);
			result.dirs[relativePath] = dirSize;
		} else {
			const size = getFileSize(fullPath);
			result.files.push({ path: path.relative(baseDir, fullPath), size });
		}
	}

	return result;
}

// ============ 主逻辑 ============

console.log('\n📦 微信小程序包体积分析');
console.log('='.repeat(60));
console.log('分析目录:', TARGET_DIR);

if (!fs.existsSync(TARGET_DIR)) {
	console.log('\n⚠️  构建产物目录不存在，请先执行构建（HBuilderX → 发行 → 微信小程序）');
	console.log('   默认分析路径: unpackage/dist/build/mp-weixin');
	console.log('   可通过 --dir 指定其他路径\n');
	process.exit(1);
}

const { files, dirs } = walkDir(TARGET_DIR);

// 总大小
const totalSize = files.reduce((sum, f) => sum + f.size, 0);
console.log('总大小:', formatSize(totalSize));

// 检查总包限制
if (totalSize > LIMITS.total) {
	console.log('⚠️  超过总包限制 20MB！');
} else {
	console.log('✅ 总包大小在限制内 (' + formatSize(LIMITS.total) + ')');
}

// 主包 vs 分包大小
console.log('\n📂 目录体积分布:');
console.log('-'.repeat(50));

const sortedDirs = Object.entries(dirs).sort((a, b) => b[1] - a[1]);

for (const [dirName, size] of sortedDirs) {
	const pct = ((size / totalSize) * 100).toFixed(1);
	const bar = '█'.repeat(Math.round((size / totalSize) * 30));
	const limitCheck = size > LIMITS.subPackage ? ' ⚠️ 超 2MB!' : '';
	console.log(`  ${dirName.padEnd(30)} ${formatSize(size).padStart(10)}  ${pct.padStart(5)}% ${bar}${limitCheck}`);
}

// 最大的 20 个文件
console.log('\n📄 最大的 20 个文件:');
console.log('-'.repeat(50));

const topFiles = files.sort((a, b) => b.size - a.size).slice(0, 20);
for (const f of topFiles) {
	console.log(`  ${f.path.padEnd(50)} ${formatSize(f.size).padStart(10)}`);
}

// 文件类型分布
console.log('\n📊 文件类型分布:');
console.log('-'.repeat(50));

const typeSizes = {};
for (const f of files) {
	const ext = path.extname(f.path) || '(无扩展名)';
	typeSizes[ext] = (typeSizes[ext] || 0) + f.size;
}

const sortedTypes = Object.entries(typeSizes).sort((a, b) => b[1] - a[1]);
for (const [ext, size] of sortedTypes) {
	const pct = ((size / totalSize) * 100).toFixed(1);
	console.log(`  ${ext.padEnd(15)} ${formatSize(size).padStart(10)}  ${pct.padStart(5)}%`);
}

// 总结
console.log('\n📋 总结:');
console.log('='.repeat(60));
console.log(`  总文件数: ${files.length}`);
console.log(`  总大小:   ${formatSize(totalSize)} / ${formatSize(LIMITS.total)}`);
console.log(`  最大文件: ${topFiles[0]?.path || 'N/A'} (${formatSize(topFiles[0]?.size || 0)})`);

const oversizedDirs = sortedDirs.filter(([, size]) => size > LIMITS.subPackage);
if (oversizedDirs.length > 0) {
	console.log('\n⚠️  以下目录超过 2MB 分包限制:');
	oversizedDirs.forEach(([name, size]) => {
		console.log(`    ${name}: ${formatSize(size)}`);
	});
}

console.log('');
