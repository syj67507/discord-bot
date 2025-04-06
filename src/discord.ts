/**
 * @fileoverview
 * This file is going to the main entrypoint to the discord application
 */
import "reflect-metadata";
import { Client, GatewayIntentBits } from "discord.js";
import { config } from "./config";
import { setupAutocompleteHandler } from "./handlers/autocomplete.handler";
import { setupSlashCommandHandler } from "./handlers/slash-command.handler";
import { setupClientReadyHandler } from "./handlers/client-ready.handler";

export async function startUpDiscordClient() {
  // Setup the discord client
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });

  setupClientReadyHandler(client);
  setupSlashCommandHandler(client);
  setupAutocompleteHandler(client);

  client.login(config.token);
}
