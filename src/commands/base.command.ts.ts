import { SharedSlashCommand, ChatInputCommandInteraction } from "discord.js";

/**
 * Base command definition for this discord application
 *
 * All commands are expected to extend this class and match this definition
 */
export class BaseCommand {
  static registrationData: SharedSlashCommand;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(interaction: ChatInputCommandInteraction): void {
    throw new Error("Method not implemented.");
  }
}
