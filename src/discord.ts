/**
 * @fileoverview
 * This file is going to the main entrypoint to the discord application
 */
import "reflect-metadata";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { commands } from "./commands";
import { config } from "./config";
import { container } from "tsyringe";
import { ContextProvider } from "./providers/context.provider";
import { BaseCommand } from "./commands/base.command";
import { LoggerProvider } from "./providers/logger.provider";

export async function startUpDiscordClient() {
  // Setup the discord client
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });

  client.on(Events.ClientReady, () => {
    const logger = container.resolve(LoggerProvider);
    logger.setName("Startup");
    logger.log("Client is online");
  });

  client.login(config.token);

  client.on(Events.InteractionCreate, async (interaction) => {
    // ignore any commands that are not slash commands
    if (!interaction.isChatInputCommand()) {
      return;
    }

    // Setting up execution container and system logger
    const executionContainer = container.createChildContainer();
    executionContainer.register<ContextProvider>(ContextProvider, {
      useValue: new ContextProvider(),
    });
    const logger = executionContainer.resolve(LoggerProvider);
    logger.setName("System");

    logger.debug("Fetching command definition from interaction...");
    const Command: typeof BaseCommand = commands.get(interaction.commandName);
    if (!Command) {
      return; // command not found
    }

    // resolve the command and execute
    logger.debug("Resolving command and executing...");
    const command = executionContainer.resolve(Command);
    await command.execute(interaction);
    logger.debug("Command execution finished.");
  });
}
