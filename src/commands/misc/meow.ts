import { CommandInteraction, GuildMember } from "discord.js";
import {
    AudioPlayerStatus,
    DiscordGatewayAdapterCreator,
    VoiceConnectionStatus,
    createAudioPlayer,
    createAudioResource,
    entersState,
    getVoiceConnection,
    getVoiceConnections,
    joinVoiceChannel,
} from "@discordjs/voice";
import path from "path";
import { Command } from "../../custom/base";

const meowCommand: Command = {
    name: "meow",
    description: "Kitty Cat replies with Meow!",
    aliases: ["cat", "kitten", "kit"],
    enabled: true,
    options: [],
    async run(interaction: CommandInteraction) {
        if (interaction.member instanceof GuildMember === false) {
            // Unable to do anything because data object do not line up
            console.log("Unable to do anything because data object do not line up");
            return null;
        }

        const member = interaction.member as GuildMember;
        if (member.voice.channel === null) {
            console.log("You are not connected to a voice channel");
            return null;
        }
        joinVoiceChannel({
            channelId: member.voice.channel.id,
            guildId: member.voice.channel.guild.id,
            // casted due to typing issues (https://github.com/discordjs/voice/issues/166)
            adapterCreator: member.voice.channel.guild
                .voiceAdapterCreator as DiscordGatewayAdapterCreator,
        });
        const connection = getVoiceConnection(member.voice.channel.guild.id)!;
        connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
            console.log(oldState.status, newState.status);
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
                // Seems to be reconnecting to a new channel - ignore disconnect
            } catch (error) {
                // Seems to be a real disconnect which SHOULDN'T be recovered from
                connection.destroy();
            }
        });
        console.log(__dirname);
        try {
            await entersState(connection!, VoiceConnectionStatus.Ready, 5_000);
            console.log("ready to play audio");

            const player = createAudioPlayer();
            player.on("stateChange", (oldState, newState) => {
                console.log("Audio player:", oldState.status, "->", newState.status);
            });
            const resourcePath = path.join(
                __dirname,
                "..",
                "..",
                "..",
                "media",
                "prominence-burn-1c9da3a6.1280x720r.mp4"
            );
            console.log(resourcePath);
            const resource = createAudioResource(resourcePath);
            player.play(resource);

            connection.subscribe(player);
        } catch (error) {
            console.error(error);
        }
        await interaction.reply("Meow!");
        return null;
    },
};

export default meowCommand;
