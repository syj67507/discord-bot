import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "./base.command.ts";
import { inject, injectable } from "tsyringe";
import { LoggerProvider } from "../providers/logger.provider";

@injectable()
export class PingCommand extends BaseCommand {
  // explicit inject decorator is needed due to the limitation of vitest and tsyringe throwing
  // TypeInfo errors when resolving nested dependencies
  constructor(@inject(LoggerProvider) private readonly logger: LoggerProvider) {
    super();
  }

  static registrationData = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pings the bot to see if it is responsive")
    .addStringOption((option) =>
      option
        .setName("reply")
        .setDescription("An optional message that the bot will send back."),
    );

  async execute(interaction: ChatInputCommandInteraction) {
    this.logger.log("Starting ping command...");

    // get options
    const replyOption = interaction.options.getString("reply");

    let message = "Pong!";
    if (replyOption) {
      message += ` ${replyOption}`;
    }
    await interaction.reply(message);
    this.logger.log("Finished ping command.");
  }
}
