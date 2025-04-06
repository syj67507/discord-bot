import { Client, Events } from "discord.js";
import { container } from "tsyringe";
import { LoggerProvider } from "../providers/logger.provider";

export function setupClientReadyHandler(client: Client) {
  client.on(Events.ClientReady, () => {
    const logger = container.resolve(LoggerProvider);
    logger.setName("Startup");
    logger.log("Client is online");
  });
}
