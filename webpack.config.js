const path = require('path');

module.exports = {
  entry: path.join(__dirname, 'app', 'index.tsx'),
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
    alias: {
      app: path.resolve(__dirname, 'app'),
    },
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: '/node_modules/',
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'postcss-loader',
        ],
      },
    ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'out', 'app'),
  },
};
