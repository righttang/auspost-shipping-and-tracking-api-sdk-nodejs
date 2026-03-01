module.exports = {
  branches: ["main"],
  tagFormat: "mcp-v${version}",
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        releaseRules: [{ type: "docs", release: "patch" }],
      },
    ],
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/exec",
      {
        prepareCmd:
          "cd packages/auspost-mcp-server && npm version ${nextRelease.version} --no-git-tag-version",
        publishCmd:
          "cd packages/auspost-mcp-server && npm publish --access public",
      },
    ],
  ],
};
