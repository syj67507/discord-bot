import { Client, Events } from "discord.js";
import { ContextProvider } from "../providers/context.provider";
import { container } from "tsyringe";
import { LoggerProvider } from "../providers/logger.provider";
import { BaseCommand } from "../commands/base.command";
import { commands } from "../commands";

export function setupAutocompleteHandler(client: Client) {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isAutocomplete()) {
      return;
    }

    const executionContainer = container.createChildContainer();
    executionContainer.register(ContextProvider, {
      useValue: new ContextProvider(),
    });
    const logger = executionContainer.resolve(LoggerProvider);
    logger.setName("Autocomplete");

    logger.debug("Resolving command and executing autocomplete...");
    const Command: typeof BaseCommand = commands.get(interaction.commandName);
    const command = container.resolve(Command);
    await command.autocomplete(interaction);
    logger.debug("Command autocomplete finished.");
  });
}
