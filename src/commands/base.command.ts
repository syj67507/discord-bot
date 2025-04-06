import {
  SharedSlashCommand,
  ChatInputCommandInteraction,
  InteractionResponse,
} from "discord.js";

/**
 * Base command definition for this discord application
 *
 * All commands are expected to extend this class and match this definition
 */
export class BaseCommand {
  static registrationData: SharedSlashCommand;

  async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<InteractionResponse> {
    throw new Error("Method not implemented.");
  }
}
