const path = require("path");
const { LicenseWebpackPlugin } = require("license-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  output: {
    path: path.resolve(__dirname, "docs"),
    filename: "main.bundle.js",
  },
  plugins: [
    new LicenseWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [{ from: "public" }],
    }),
  ],
  devServer: {
    contentBase: path.resolve(__dirname, "docs"),
    open: true,
    port: 3000,
  },
};
