#!/usr/bin/env node

const path = require("path");

process.env.EXPO_NO_METRO_WORKSPACE_ROOT =
  process.env.EXPO_NO_METRO_WORKSPACE_ROOT || "1";

require(
  require.resolve("@expo/cli/build/bin/cli", {
    paths: [path.resolve(__dirname, "..")],
  }),
);
