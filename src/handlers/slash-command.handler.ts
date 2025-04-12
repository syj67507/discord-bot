import { Client, Events } from "discord.js";
import { commands } from "../commands";
import { BaseCommand } from "../commands/base.command";
import { ContextProvider } from "../providers/context.provider";
import { LoggerProvider } from "../providers/logger.provider";
import { container } from "tsyringe";

export function setupSlashCommandHandler(client: Client) {
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
    logger.setName("SlashCommand");

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
