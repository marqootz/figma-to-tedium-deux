const path = require('path');

module.exports = {
  entry: './src/simple-browser-entry.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'simple-animation-system.js',
    path: path.resolve(__dirname, 'shared-htmls'),
  },
  mode: 'development',
  devtool: 'source-map',
};
