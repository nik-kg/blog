/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@automattic/isolated-block-editor'],

  experimental: {
    esmExternals: 'loose', // Разрешаем смешивание ESM/CJS для date-fns
  },

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

    // ВАЖНО: Форсируем использование 'main' вместо 'module' для IBE
    // Это заставляет webpack использовать build/index.js вместо build-module/index.js
    config.resolve.mainFields = ['main', 'module']

    return config
  },
}

module.exports = nextConfig
