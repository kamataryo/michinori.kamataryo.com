const path = require("path");
const { LicenseWebpackPlugin } = require("license-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  output: {
    path: path.resolve(__dirname, "docs"),
    filename: "main.bundle.js",
  },
  module: {
    rules: [
      { test: /\.css$/, use: "css-loader" },
    ],
  },
  plugins: [
    new LicenseWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [{ from: "public" }],
    }),
  ],
  devServer: {
    open: true,
  },
};
