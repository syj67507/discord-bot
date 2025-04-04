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
import { BaseCommand } from "./commands/base.command.ts";

export async function startUpDiscordClient() {
  // Setup the discord client
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  client.on(Events.ClientReady, () => {
    console.log("Ready!");
  });

  client.login(config.token);

  client.on(Events.InteractionCreate, (interaction) => {
    // ignore any commands that are not slash commands
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const Command: typeof BaseCommand = commands.get(interaction.commandName);
    if (!Command) {
      return; // command not found
    }

    // Create a new container for the new execution
    const executionContainer = container.createChildContainer();
    executionContainer.register<ContextProvider>(ContextProvider, {
      useValue: new ContextProvider(),
    });

    // resolve the command and execute
    const command = executionContainer.resolve(Command);
    command.execute(interaction);
  });
}
