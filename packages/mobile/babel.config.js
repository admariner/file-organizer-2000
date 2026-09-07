
module.exports = function (api) {
  api.cache(true);
  return {
    // Presets live in overrides. Babel *merges* overrides with parent presets, so
    // putting nativewind/babel on the parent still rewrites the stack shim (build 38).
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@": "./",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
    overrides: [
      {
        test: /shims[\\/]create-native-stack-navigator\.js$/,
        presets: [["babel-preset-expo", { jsxImportSource: "react" }]],
      },
      {
        exclude: /shims[\\/]create-native-stack-navigator\.js$/,
        presets: [
          ["babel-preset-expo", { jsxImportSource: "nativewind" }],
          "nativewind/babel",
        ],
      },
    ],
  };
};
