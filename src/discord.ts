/**
 * @fileoverview
 * This file is going to the main entrypoint to the discord application
 */
import { Client, GatewayIntentBits } from "discord.js";
import { config } from "./config";
import { setupAutocompleteHandler } from "./handlers/autocomplete.handler";
import { setupSlashCommandHandler } from "./handlers/slash-command.handler";
import { setupClientReadyHandler } from "./handlers/client-ready.handler";
import { container } from "tsyringe";
import { LavalinkProvider } from "./providers/lavalink.provider";

export async function bootstrapDiscordClient() {
  // Setup the discord client
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });

  container.register("Client", { useValue: client });

  // Singletons are lazily instantiated but Lavalink needs to be instantiated upon start
  // Resolving it at the beginning forces it to be instantiated
  container.resolve(LavalinkProvider);

  // setup event handlers for the client
  setupClientReadyHandler(client);
  setupSlashCommandHandler(client);
  setupAutocompleteHandler(client);

  client.login(config.token);
}
