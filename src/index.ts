import { config } from "./config";
import { startUpDiscordClient } from "./discord";
import { registerCommands } from "./register-commands";

async function main() {
  if (config.reloadCommands) {
    await registerCommands(); // Deploy the command metadata to the servers
  }
  startUpDiscordClient();
}

main();
