const path = require("path");
const fs = require("fs");

// Custom plugin to copy the built file to shared-htmls
class CopyToSharedHtmlsPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('CopyToSharedHtmlsPlugin', (compilation) => {
      const sourceFile = path.resolve(__dirname, 'dist-refactored', 'refactored-system.js');
      const targetFile = path.resolve(__dirname, 'shared-htmls', 'refactored-system.js');
      
      if (fs.existsSync(sourceFile)) {
        fs.copyFileSync(sourceFile, targetFile);
        console.log('✅ Copied refactored-system.js to shared-htmls/');
      } else {
        console.log('❌ Source file not found:', sourceFile);
      }
    });
  }
}

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
  },
  plugins: [
    new CopyToSharedHtmlsPlugin()
  ]
};
