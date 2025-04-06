import {
  SharedSlashCommand,
  ChatInputCommandInteraction,
  InteractionResponse,
  AutocompleteInteraction,
} from "discord.js";

/**
 * Base command definition for this discord application
 *
 * All commands are expected to extend this class and match this definition
 */
export class BaseCommand {
  static registrationData: SharedSlashCommand;

  async execute(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interaction: ChatInputCommandInteraction,
  ): Promise<InteractionResponse> {
    throw new Error("Method not implemented.");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
