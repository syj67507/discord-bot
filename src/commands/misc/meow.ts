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

const meowCommand: Command = {
    name: "meow",
    description: "Kitty Cat replies with Meow!",
    aliases: ["cat", "kitten", "kit"],
    enabled: true,
    options: [
        {
            name: "get",
            description: "get description",
            type: OptionType.String,
            required: false,
        },
    ],
    async run(interaction: CommandInteraction, args: any) {
        // console.log(args.get);
        // if (args.get) {
        //     const vc = getVoiceConnections();
        //     console.log(vc.size);
        //     return null;
        // }

        const audioManager = AudioManager.getInstance(
            interaction.client,
            interaction.guildId!
        );
        audioManager.test();
        // const channel = (interaction.member as GuildMember)!.voice!.channel!;

        // await audioManager.connect(channel);
        return null;
        // audioManager.play();

        // const track: Track = {
        //     duration: "",
        //     title: "",
        //     link: "",
        // };
        // audioManager.queue(track);
        // audioManager.play(interaction.guildId!);
        return null;
    },
};

export default meowCommand;
