/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@automattic/isolated-block-editor'],
  webpack: (config, { isServer }) => {
    // Исправляем разрешение .mjs файлов для date-fns и других модулей
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.mjs': ['.mjs', '.mts'],
    }

    // Добавляем .mjs в список расширений
    if (!config.resolve.extensions.includes('.mjs')) {
      config.resolve.extensions.push('.mjs')
    }

    // Фикс "use client" директивы в @ariakit - заменяем CJS импорты на ESM
    config.resolve.alias = {
      ...config.resolve.alias,
      '@ariakit/react/cjs/index.cjs': '@ariakit/react/esm/index.mjs',
      '@ariakit/core/cjs/index.cjs': '@ariakit/core/esm/index.mjs',
    }

    return config
  },
}

module.exports = nextConfig
