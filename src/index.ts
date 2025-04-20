import "reflect-metadata";
import { config } from "./config";
import { startUpDiscordClient } from "./discord";
import { registerCommands } from "./register-commands";
import { container } from "tsyringe";
import { LoggerProvider } from "./providers/logger.provider";
import { generateDependencyReport } from "@discordjs/voice";

async function main() {
  if (config.reloadCommands) {
    await registerCommands(); // Deploy the command metadata to the servers
  }

  const logger = container.resolve(LoggerProvider);
  logger.setName("Startup");
  logger.log(...generateDependencyReport().split("\n"));

  startUpDiscordClient();
}

main();
