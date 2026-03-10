#!/usr/bin/env node
import { execSync } from "node:child_process";

// Strip accidental leading "--" (e.g. from `pnpm release -- "msg"`)
const raw = process.argv[2];
const message = raw ? raw.replace(/^--/, "").trim() : "";

if (!message) {
  console.error('Usage: pnpm release "your commit message"');
  process.exit(1);
}

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

const runSafe = (cmd) => {
  try {
    execSync(cmd, { stdio: "inherit" });
    return true;
  } catch {
    return false;
  }
};

console.log("\n>> Staging all changes...");
run("git add .");

const status = execSync("git status --porcelain").toString().trim();
if (status) {
  console.log(`\n>> Committing: ${message}`);
  run(`git commit -m "${message}"`);
} else {
  console.log("\n>> Nothing to commit, skipping commit step.");
}

console.log("\n>> Bumping version (patch)...");
run('npm version patch -m "chore(release): %s"');

console.log("\n>> Pushing commit + tag...");
run("git push origin main --follow-tags");

console.log("\n✓ Release pushed! Check GitHub Actions for build status.");
