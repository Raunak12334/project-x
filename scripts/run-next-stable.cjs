const { existsSync } = require("node:fs");
const { join, resolve } = require("node:path");
const { spawnSync } = require("node:child_process");

const REQUIRED_NODE_VERSION = "22.22.2";
const REQUIRED_NODE_TAG = `v${REQUIRED_NODE_VERSION}`;
const repoRoot = resolve(__dirname, "..");
const nextBin = join(repoRoot, "node_modules", "next", "dist", "bin", "next");
const bundledWindowsNode = join(
  repoRoot,
  ".tools",
  "node-v22.22.2-win-x64",
  "node.exe",
);
const DEFAULT_NODE_OPTIONS = "--max-old-space-size=4096";

function resolveNodeBinary() {
  if (process.version === REQUIRED_NODE_TAG) {
    return process.execPath;
  }

  if (process.platform === "win32" && existsSync(bundledWindowsNode)) {
    return bundledWindowsNode;
  }

  return null;
}

const nodeBinary = resolveNodeBinary();

if (!nodeBinary) {
  console.error(
    [
      `This project requires Node ${REQUIRED_NODE_VERSION}.`,
      `Current runtime: ${process.version}`,
      "Install/use Node 22.22.2, or on Windows place the portable runtime at",
      bundledWindowsNode,
    ].join("\n"),
  );
  process.exit(1);
}

function withDefaultNodeOptions(env) {
  const existingOptions = env.NODE_OPTIONS || "";
  if (existingOptions.includes("--max-old-space-size")) {
    return env;
  }

  return {
    ...env,
    NODE_OPTIONS: [existingOptions, DEFAULT_NODE_OPTIONS]
      .filter(Boolean)
      .join(" "),
  };
}

const result = spawnSync(nodeBinary, [nextBin, ...process.argv.slice(2)], {
  cwd: repoRoot,
  env: withDefaultNodeOptions(process.env),
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
