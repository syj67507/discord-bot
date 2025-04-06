import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { BaseCommand } from "../base.command";
import { inject, injectable } from "tsyringe";
import { LoggerProvider } from "../../providers/logger.provider";

@injectable()
export class PingCommand extends BaseCommand {
  // explicit inject decorator is needed due to the limitation of vitest and tsyringe throwing
  // TypeInfo errors when resolving nested dependencies
  constructor(@inject(LoggerProvider) private readonly logger: LoggerProvider) {
    super();
    this.logger.setName(PingCommand.name);
  }

  static registrationData = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pings the bot to see if it is responsive")
    .addStringOption((option) =>
      option
        .setName("reply")
        .setDescription("An optional message that the bot will send back.")
        .setAutocomplete(true),
    )
    .addStringOption((option) =>
      option.setName("another").setDescription("Something else"),
    );

  async execute(interaction: ChatInputCommandInteraction) {
    this.logger.log("Starting ping command...");

    // get options
    const replyOption = interaction.options.getString("reply");

    let message = "Pong!";
    if (replyOption) {
      message += ` ${replyOption}`;
    }

    return await interaction.reply(message);
    this.logger.log("Finished ping command.");
  }

  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();
    const choices = ["One", "Two", "Three"];
    const filtered = choices.filter((choice) =>
      choice.startsWith(focusedValue),
    );
    await interaction.respond(
      filtered.map((choice) => {
        return { name: choice, value: choice };
      }),
    );
  }
}
