const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './public/script.js',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist',
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: { compress: true, mangle: true }
    })],
  },
};
