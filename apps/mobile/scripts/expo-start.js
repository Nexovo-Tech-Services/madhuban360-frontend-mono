const { spawn } = require("node:child_process");
const path = require("node:path");

const expoBin = require.resolve("expo/bin/cli", {
  paths: [path.resolve(__dirname, "..")],
});

const child = spawn(process.execPath, [expoBin, "start", ...process.argv.slice(2)], {
  cwd: path.resolve(__dirname, ".."),
  stdio: "inherit",
  env: {
    ...process.env,
    EXPO_OFFLINE: process.env.EXPO_OFFLINE || "1",
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
