/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@automattic/isolated-block-editor'],

  // Externalize date-fns for better ESM handling
  experimental: {
    esmExternals: 'loose',
  },

  webpack: (config, { isServer, webpack }) => {
    // Исправляем разрешение .mjs файлов для date-fns и других модулей
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.mjs': ['.mjs', '.mts'],
    }

    // Добавляем .mjs в список расширений
    if (!config.resolve.extensions.includes('.mjs')) {
      config.resolve.extensions.push('.mjs')
    }

    // Фикс "use client" директивы - заменяем CJS на ESM версии @ariakit
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /@ariakit\/react\/cjs/,
        (resource) => {
          resource.request = resource.request.replace(/\/cjs\//, '/esm/')
          resource.request = resource.request.replace(/\.cjs$/, '.mjs')
        }
      ),
      new webpack.NormalModuleReplacementPlugin(
        /@ariakit\/core\/cjs/,
        (resource) => {
          resource.request = resource.request.replace(/\/cjs\//, '/esm/')
          resource.request = resource.request.replace(/\.cjs$/, '.mjs')
        }
      )
    )

    return config
  },
}

module.exports = nextConfig
