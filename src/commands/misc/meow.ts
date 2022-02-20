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
import { Command, OptionType } from "../../custom/base";
import AudioManager, { Track } from "../../custom/audioManager";
import { YTClient } from "../../custom/ytclient";
import ytdl from "ytdl-core";

const meowCommand: Command = {
    name: "meow",
    description: "Kitty Cat replies with Meow!",
    aliases: ["cat", "kitten", "kit"],
    enabled: true,
    options: [
        {
            name: "mode",
            description: "get description",
            type: OptionType.String,
            required: false,
        },
    ],
    async run(interaction: CommandInteraction, args: any) {
        interaction.deferReply();
        const audioManager = AudioManager.getInstance(
            interaction.client,
            interaction.guildId!
        );
        const channel = (interaction.member as GuildMember)!.voice!.channel!;

        await audioManager.connect(channel);
        const yt = new YTClient();
        audioManager.queue(await yt.search("mood"));
        audioManager.queue(await yt.search("positions"));

        if (args.mode === "once") {
            audioManager.play(
                createAudioResource(
                    ytdl(
                        (await yt.getVideo("https://www.youtube.com/shorts/csv3v5bSIEc"))
                            .link
                    )
                ),
                "once"
            );
        } else {
            audioManager.start();
        }
        interaction.editReply("msg");

        // await new Promise((r) => setTimeout(r, 2000));

        return null;
    },
};

export default meowCommand;
