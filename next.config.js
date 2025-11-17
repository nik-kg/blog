/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@automattic/isolated-block-editor'],
  webpack: (config) => {
    // Разрешаем импорт CSS из node_modules для IBE
    config.module.rules.push({
      test: /\.scss$/,
      include: /node_modules\/@automattic\/isolated-block-editor/,
      use: [
        'style-loader',
        'css-loader',
        'sass-loader'
      ]
    })

    return config
  }
}

module.exports = nextConfig
