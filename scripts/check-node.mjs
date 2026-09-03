#!/usr/bin/env node
const major = Number(process.versions.node.split(".")[0]);
if (!Number.isFinite(major) || major < 22) {
  console.error(`VELIOS requires Node.js 22 or newer. Current: ${process.versions.node}`);
  process.exit(1);
}
