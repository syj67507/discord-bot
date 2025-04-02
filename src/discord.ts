/**
 * @fileoverview
 * This file is going to the main entrypoint to the discord application
 */

import { Client, Events, GatewayIntentBits } from "discord.js";
import { commands } from "./commands";
import { config } from "./config";

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

    const Command = commands.get(interaction.commandName);
    if (!Command) {
      return; // command not found
    }

    new Command().execute(interaction); // instantiate the command so that it can be executed
  });
}
