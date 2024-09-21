/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
  serverBuildPath: "build/index.js",
  ignoredRouteFiles: ["**/*.css"],
  serverDependenciesToBundle: [
    /^remix-utils.*/,
    /^rehype.*/,
    /^remark.*/,
    /^unified.*/,
    "@sindresorhus/slugify",
  ],
};
