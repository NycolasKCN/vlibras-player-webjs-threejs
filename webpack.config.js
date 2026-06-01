var path = require("path");
var CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  target: ["web", "es5"],
  entry: path.resolve("./src/index.ts"),
  output: {
    filename: "vlibras.js",
    path: path.resolve("./build"),
    clean: true
  },
  resolve: {
    extensions: [".ts", ".js"],
    fallback: {
      events: require.resolve("events/")
    }
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
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: "src/target", to: "target" }]
    })
  ]
};
