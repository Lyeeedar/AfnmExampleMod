const path = require('path');
const package = require('./package.json');
const webpack = require('webpack');

module.exports = {
  entry: './src/mod.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name][ext]',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'mod.js',
    path: path.resolve(__dirname, `dist/${package.name}`),
    library: {
      name: 'AFNMMod',
      type: 'umd',
      export: 'default',
    },
    globalObject: 'this',
    publicPath: 'mod://',
  },
  plugins: [
    new webpack.DefinePlugin({
      MOD_METADATA: JSON.stringify({
        name: package.name,
        version: package.version,
        author: package.author,
        description: package.description,
      }),
    }),
  ],
};
