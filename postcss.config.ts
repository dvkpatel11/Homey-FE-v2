import type { Config } from "postcss-load-config";

const config: Config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === "production" && {
      cssnano: {
        preset: [
          "default",
          {
            discardComments: { removeAll: true },
            normalizeWhitespace: false,
            minifySelectors: true,
            minifyParams: true,
            minifyFontValues: true,
            colormin: true,
            convertValues: {
              length: false,
            },
          },
        ],
      },
    }),
  },
};

export default config;
