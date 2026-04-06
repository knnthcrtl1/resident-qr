const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the monorepo root so Metro sees packages/* (merge with defaults)
config.watchFolders = [...config.watchFolders, workspaceRoot];

// Resolve modules from both app node_modules and workspace root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Follow npm workspace symlinks/junctions for @qr/* packages
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
