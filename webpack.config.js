const path = require("path");
const LicenseWebpackPlugin = require("license-webpack-plugin")
  .LicenseWebpackPlugin;

module.exports = {
  output: {
    path: path.resolve(__dirname, "docs"),
    filename: "main.bundle.js",
  },
  plugins: [new LicenseWebpackPlugin()],
};
