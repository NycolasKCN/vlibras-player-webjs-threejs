// webpack.config.js
import * as path from "path";
import { fileURLToPath } from "url";
import CopyWebpackPlugin from "copy-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: "production",
  target: ["web", "es5"],
  entry: path.resolve(__dirname, "./src/index.ts"),
  output: {
    filename: "vlibras.js",
    path: path.resolve(__dirname, "./build"),
    clean: true,
    library: {
      name: "VLibras",
      type: "umd",
      export: "default",
    },
    globalObject: "this",
  },
  resolve: {
    extensions: [".ts", ".js"],
    fallback: {
      events: "events/",
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/target", to: "target" },
        {
          from: path.resolve(__dirname, "node_modules/three/examples/jsm/libs/draco"),
          to: path.resolve(__dirname, "build/libs/js/draco"),
        },
      ],
    }),
  ],
};
