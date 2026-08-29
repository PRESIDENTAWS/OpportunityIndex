import next from "eslint-config-next";

// eslint-config-next ships flat config in Next 16, so no FlatCompat shim.
const config = [
  ...next,
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
];

export default config;
