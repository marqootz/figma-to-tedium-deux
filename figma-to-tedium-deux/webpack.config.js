const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/code.ts",
  output: {
    filename: "code.js",
    path: path.resolve(__dirname, "dist"),
    library: {
      type: "umd"
    },
    globalObject: "this"
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  externals: {
    "figma": "figma"
  },
  optimization: {
    minimize: false
  }
};
