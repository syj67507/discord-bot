import "reflect-metadata";
import { config } from "./config";
import { bootstrapDiscordClient } from "./discord";
import { registerCommands } from "./register-commands";

async function main() {
  if (config.reloadCommands) {
    await registerCommands(); // Deploy the command metadata to the servers
  }

  bootstrapDiscordClient();
}

main();
