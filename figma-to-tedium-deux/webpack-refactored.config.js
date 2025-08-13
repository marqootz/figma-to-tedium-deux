const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/browser-entry.ts",
  output: {
    filename: "refactored-system.js",
    path: path.resolve(__dirname, "dist-refactored"),
    library: {
      type: "umd",
      name: "FigmaRefactoredSystem"
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
