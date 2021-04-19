import { CommandoMessage, Command, CommandoClient } from "discord.js-commando";
import texttospeech from "@google-cloud/text-to-speech";
import * as protos from "@google-cloud/text-to-speech/build/protos/protos";
import util from "util";
import fs from "fs";
import MusicManager from "../../custom/music-manager";
import { logger as log, format as f } from "../../custom/logger";

module.exports = class SayCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "say",
            group: "misc",
            memberName: "say",
            description:
                "Takes some text and synthesizes speech to the voice channel.",
            aliases: ["tts", "texttospeech", "text-to-speech"],
            args: [
                {
                    key: "text",
                    prompt: "What do you want me to say?",
                    type: "string",
                    validate: (text: string) => text.length <= 100,
                },
            ],
            argsPromptLimit: 0,
        });
    }

    async run(message: CommandoMessage, args: any) {
        const mm = MusicManager.getInstance(this.client);
        if (mm.isPlaying()) {
            return message.reply(
                "You must first stop playing music before calling this command."
            );
        }

        log.debug(f("say", `Creating request with text: ${args.text}`));
        const client = new texttospeech.TextToSpeechClient();
        const request = {
            input: { text: args.text as string },
            voice: {
                languageCode: "en-US",
                ssmlGender:
                    protos.google.cloud.texttospeech.v1.SsmlVoiceGender.MALE,
            },
            audioConfig: {
                audioEncoding:
                    protos.google.cloud.texttospeech.v1.AudioEncoding.MP3,
                volumeGainDb: 10.0,
            },
        };
        log.debug(f("say", "Awaiting response..."));
        const [response] = await client.synthesizeSpeech(request);
        log.debug(f("say", "Response retrieved."));
        fs.writeFileSync("media/output.mp3", response.audioContent!, "binary");
        log.debug(f("say", "Audio content written to file: media/output.mp3"));

        log.debug(
            f("say", "Joining voice channel and streaming synthesized text.")
        );
        const connection = await message.member!.voice.channel?.join();
        const dispatcher = connection?.play("media/output.mp3");
        dispatcher?.setVolume(1);
        dispatcher?.on("finish", () => {
            message.member!.voice.channel?.leave();
        });
        return null;
    }
};
