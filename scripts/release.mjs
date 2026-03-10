#!/usr/bin/env node
import { execSync } from "node:child_process";

const message = process.argv[2];
if (!message) {
  console.error('Usage: npm run release "your commit message"');
  process.exit(1);
}

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

console.log("\n>> Staging all changes...");
run("git add .");

console.log(`\n>> Committing: ${message}`);
run(`git commit -m "${message}"`);

console.log("\n>> Bumping version (patch)...");
run('npm version patch -m "chore(release): %s"');

console.log("\n>> Pushing commit + tag...");
run("git push origin main --follow-tags");

console.log("\n✓ Release pushed! Check GitHub Actions for build status.");
