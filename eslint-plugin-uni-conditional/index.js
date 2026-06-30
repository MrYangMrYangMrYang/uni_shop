/**
 * 本地 ESLint 插件：预处理 uni-app 条件编译指令
 *
 * 背景：ESLint 解析器不认识 // #ifdef VUE3 / // #ifndef VUE3 / // #endif
 * 会把 Vue2 和 Vue3 两个分支当成同一作用域，导致 import 重复声明等解析错误
 *
 * 策略：本项目是 Vue2 工程，解析前移除 VUE3 专属代码块，解包 VUE2 代码块
 * 对没有条件编译指令的文件无影响（regex 不匹配，原样返回）
 */
const processor = {
  preprocess(text) {
    let processed = text

    // 移除 // #ifdef VUE3 ... // #endif 块（VUE3 专属代码）
    processed = processed.replace(
      /\/\/\s*#ifdef\s+VUE3[\s\S]*?\/\/\s*#endif/g,
      ''
    )

    // 解包 // #ifndef VUE3 ... // #endif 块（保留内部代码，移除指令注释）
    processed = processed.replace(
      /\/\/\s*#ifndef\s+VUE3\s*\r?\n([\s\S]*?)\/\/\s*#endif/g,
      '$1'
    )

    // 清理移除指令后产生的连续空行（最多保留 1 个空行），避免 prettier 报多余空行
    processed = processed.replace(/\n{3,}/g, '\n\n')

    // 清理末尾多余空行（prettier 要求文件以单个换行符结尾）
    processed = processed.replace(/\s+$/, '\n')

    return [processed]
  },
  postprocess(messages) {
    return messages[0]
  }
}

module.exports = {
  processors: {
    vue2: processor
  }
}
