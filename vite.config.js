import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import AutoImport from 'unplugin-auto-import/vite'
import eslintPlugin from 'vite-plugin-eslint'

export default defineConfig({
    plugins: [uni(), AutoImport({ imports: ['vue', 'uni-app', 'pinia'], dirs: ['src/hooks', 'src/utils'], dts: 'src/auto-imports.d.ts', eslintrc: { enabled: true, filepath: './.eslintrc-auto-import.json', globalsPropValue: true } }), eslintPlugin({ include: ['src/**/*.{js,vue}'], cache: true })],
    css: { preprocessorOptions: { scss: { silenceDeprecations: ['legacy-js-api'] } } }
})
