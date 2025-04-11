import { inject, injectable } from "tsyringe";
import { BaseCommand } from "../base.command";
import { LoggerProvider } from "../../providers/logger.provider";
import {
  ChatInputCommandInteraction,
  InteractionContextType,
  InteractionResponse,
  SlashCommandBuilder,
} from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";
import { DiscordVoiceManager } from "./discord-voice.manager";

@injectable()
export class StopCommand extends BaseCommand {
  constructor(
    @inject(LoggerProvider) private readonly logger: LoggerProvider,
    @inject(DiscordVoiceManager)
    private readonly audioPlayerManager: DiscordVoiceManager,
  ) {
    super();
  }

  static registrationData = new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stops the bot from playing music")
    .setContexts([InteractionContextType.Guild]);

  async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<InteractionResponse> {
    if (!interaction.guildId) {
      return interaction.reply("How did you get here?");
    }
    const connection = getVoiceConnection(interaction.guildId);
    connection?.destroy();

    this.audioPlayerManager.stopAudioPlayer();
    this.audioPlayerManager.destroyAudioPlayer();
    this.audioPlayerManager.clearQueue();

    // await interaction.reply({
    //   embeds: [
    //     new EmbedBuilder()
    //       .setColor("Aqua")
    //       .setAuthor({ name: "🛑 Stopped playback. 🛑" })
    //       .setTitle(`${interaction.user} has stopped the music.`)
    //       .addFields({
    //         name: "\u200B",
    //         value: "Start the music back up by using the play command!",
    //       }),
    //   ],
    // });
    return await interaction.reply(
      `${interaction.user} has stopped the music.`,
    );
  }
}
