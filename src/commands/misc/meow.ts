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
        console.log(args.get);
        const beforeVC = getVoiceConnections();
        console.log(beforeVC.size);
        const audioManager = AudioManager.getInstance(
            interaction.client,
            interaction.guildId!
        );
        // audioManager.test();
        const channel = (interaction.member as GuildMember)!.voice!.channel!;

        await audioManager.connect(channel);
        const track: Track = {
            duration: "",
            title: "",
            link: "",
        };
        audioManager.queue(track);
        await audioManager.play();
        interaction.reply("WooHOO");
        // const afterVC = getVoiceConnections();
        // console.log(afterVC.size);
        // interaction.reply(`Before: ${beforeVC.size} | After: ${afterVC.size}`);
        // await new Promise((r) => setTimeout(r, 2000));
        // await audioManager.disconnect(interaction.guildId!, "meow command");

        return null;
        // audioManager.play();

        // audioManager.play(interaction.guildId!);
        return null;
    },
};

export default meowCommand;
