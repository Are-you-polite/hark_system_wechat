import fs from 'fs'
import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import pluginPrettier from 'eslint-plugin-prettier/recommended'

// 1. 读取 auto-import 自动注入的全局变量
let autoImportGlobals = {}
try {
    const autoImportFile = fs.readFileSync('./.eslintrc-auto-import.json', 'utf8')
    autoImportGlobals = JSON.parse(autoImportFile).globals
} catch {
    console.warn('⚠️ 未找到或解析失败 .eslintrc-auto-import.json, 将跳过注入 auto-import 变量。')
}
// 2. 定义环境与全局变量
const customGlobals = { ...globals.browser, ...globals.node, ...autoImportGlobals, uni: 'readonly', plus: 'readonly', wx: 'readonly', getCurrentPages: 'readonly' }
export default [{ ignores: ['dist', 'node_modules', '.eslintrc-auto-import.json'] }, js.configs.recommended, ...pluginVue.configs['flat/essential'], { languageOptions: { globals: customGlobals } }, pluginPrettier, { rules: { 'vue/multi-word-component-names': 'off' } }]
