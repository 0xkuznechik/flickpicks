import "dotenv/config";
import { spawn } from "node:child_process";
import net from "node:net";
import { URL } from "node:url";

const cwd = process.cwd();

function run(cmd, args, { quiet = false } = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, {
      cwd,
      stdio: quiet ? "ignore" : "inherit",
      shell: false
    });
    p.on("error", reject);
    p.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

async function findDockerCompose() {
  // Prefer `docker compose`; fall back to legacy `docker-compose`.
  try {
    await run("docker", ["compose", "version"], { quiet: true });
    return { cmd: "docker", baseArgs: ["compose"] };
  } catch {
    try {
      await run("docker-compose", ["version"], { quiet: true });
      return { cmd: "docker-compose", baseArgs: [] };
    } catch {
      return null;
    }
  }
}

function parseDb(urlStr) {
  const u = new URL(urlStr);
  return {
    host: u.hostname || "localhost",
    port: u.port ? Number(u.port) : 5432
  };
}

async function waitForTcp(host, port, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const ok = await new Promise((resolve) => {
      const socket = net.createConnection({ host, port });
      socket.once("connect", () => {
        socket.destroy();
        resolve(true);
      });
      socket.once("error", () => {
        socket.destroy();
        resolve(false);
      });
    });
    if (ok) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for TCP ${host}:${port}`);
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("Missing DATABASE_URL in .env");
    process.exit(1);
  }

  const dockerCompose = await findDockerCompose();
  if (!dockerCompose) {
    console.error("Docker is required for this dev setup (Postgres via docker compose).\n\nInstall Docker, then re-run: npm run dev");
    process.exit(1);
  }

  const { host, port } = parseDb(dbUrl);

  // Start Postgres
  await run(dockerCompose.cmd, [...dockerCompose.baseArgs, "up", "-d"], { quiet: false });

  // Wait for DB to accept connections
  await waitForTcp(host, port);

  // Prisma
  await run("npx", ["prisma", "generate"]);
  await run("npx", ["prisma", "migrate", "deploy"]);

  // Remix dev server
  const dev = spawn(
    "npx",
    ["remix", "vite:dev", "--host", "0.0.0.0", "--port", "5173"],
    { cwd, stdio: "inherit", shell: false }
  );

  dev.on("exit", (code) => process.exit(code ?? 0));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
