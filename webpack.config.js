const path = require("path");
const LicenseWebpackPlugin = require("license-webpack-plugin")
  .LicenseWebpackPlugin;

module.exports = {
  output: {
    path: path.resolve(__dirname, "docs"),
    filename: "main.js",
  },
  plugins: [new LicenseWebpackPlugin()],
};
