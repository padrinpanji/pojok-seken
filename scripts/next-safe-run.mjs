import { spawn, spawnSync } from "node:child_process";
import { existsSync, renameSync, rmSync, readlinkSync } from "node:fs";
import { resolve } from "node:path";

const command = process.argv[2];
const allowedCommands = new Set(["dev", "build"]);
const projectRoot = process.cwd();

if (!allowedCommands.has(command)) {
  console.error("Usage: node scripts/next-safe-run.mjs <dev|build>");
  process.exit(1);
}

function getNextProcessesInProject() {
  const result = spawnSync("ps", ["-eo", "pid=,args="], {
    encoding: "utf8"
  });

  if (result.status !== 0) {
    return [];
  }

  return result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [pid, ...args] = line.split(/\s+/);
      return {
        pid,
        args: args.join(" ")
      };
    })
    .filter(({ pid, args }) => {
      if (Number(pid) === process.pid || !/(next-server|next\s+(dev|build))/.test(args)) {
        return false;
      }

      try {
        return readlinkSync(`/proc/${pid}/cwd`) === projectRoot;
      } catch {
        return false;
      }
    });
}

const runningNextProcesses = getNextProcessesInProject();

if (runningNextProcesses.length > 0) {
  console.error("Another Next.js process is already running in this project:");
  runningNextProcesses.forEach(({ pid, args }) => {
    console.error(`- pid ${pid}: ${args}`);
  });
  console.error("Stop it first, then rerun this command. This prevents broken .next chunks.");
  process.exit(1);
}

function removeDirectory(path) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      rmSync(path, {
        recursive: true,
        force: true
      });
      return true;
    } catch (error) {
      if (attempt === 5) {
        console.warn(`Could not fully remove ${path}: ${error.message}`);
        return false;
      }

      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200);
    }
  }

  return false;
}

function cleanNextCache() {
  const nextDir = resolve(projectRoot, ".next");

  if (!existsSync(nextDir)) {
    return;
  }

  const staleDir = resolve(projectRoot, `.next-stale-${Date.now()}-${process.pid}`);

  try {
    renameSync(nextDir, staleDir);
  } catch (error) {
    if (error.code === "ENOENT") {
      return;
    }

    throw error;
  }

  removeDirectory(staleDir);
}

cleanNextCache();

const nextProcess = spawn("next", [command], {
  stdio: "inherit",
  shell: process.platform === "win32"
});

nextProcess.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
