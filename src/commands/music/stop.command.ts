import { inject, injectable } from "tsyringe";
import { BaseCommand } from "../base.command";
import { LoggerProvider } from "../../providers/logger.provider";
import {
  ChatInputCommandInteraction,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";
import { AudioPlayerManager } from "./audio-player.manager";

@injectable()
export class StopCommand extends BaseCommand {
  constructor(
    @inject(LoggerProvider) private readonly logger: LoggerProvider,
    @inject(AudioPlayerManager)
    private readonly audioPlayerManager: AudioPlayerManager,
  ) {
    super();
  }

  static registrationData = new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stops the bot from playing music")
    .setContexts([InteractionContextType.Guild]);

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guildId) {
      return;
    }
    const connection = getVoiceConnection(interaction.guildId);
    connection?.destroy();

    this.audioPlayerManager.stopAudioPlayer();
    this.audioPlayerManager.destroyAudioPlayer();

    interaction.reply(
      "Stopped playing music. Use the play command to play music again",
    );
  }
}
