import { CommandoMessage, Command, CommandoClient } from "discord.js-commando";
import texttospeech from "@google-cloud/text-to-speech";
import * as protos from "@google-cloud/text-to-speech/build/protos/protos";
import util from "util";
import fs from "fs";
import MusicManager from "../../custom/music-manager";
import { logger as log, format as f } from "../../custom/logger";

module.exports = class SayCommand extends Command {
    ttsClient: any;
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
                    validate: (text: string) => text.length <= 1000,
                },
            ],
            argsPromptLimit: 0,
        });
        this.ttsClient = new texttospeech.TextToSpeechClient();
    }

    async run(message: CommandoMessage, args: any) {
        const mm = MusicManager.getInstance(this.client);
        if (mm.isPlaying()) {
            return message.reply(
                "You must first stop playing music before calling this command."
            );
        }

        const file = "media/say.mp3";
        try {
            await this.synthesizeSpeech(args.text, file);
        } catch (error) {
            log.error(f("say", "Error in synthesizing speech"));
            log.error(f("say", error));
            return message.reply(
                "There was problem in speech synthesis. Try again later."
            );
        }

        log.debug(
            f("say", "Joining voice channel and streaming synthesized text.")
        );
        try {
            const connection = await message.member!.voice.channel?.join();
            const dispatcher = connection?.play(file);
            dispatcher?.setVolume(1);
            dispatcher?.on("finish", async () => {
                message.member!.voice.channel?.leave();
            });
        } catch (error) {
            log.error(f("say", error));
            return message.reply([
                "An error occurred.",
                "Make sure to be in a voice channel before calling this command.",
                "If errors still continue, contact the bot admin: " +
                    `${this.client.owners[0]}`,
            ]);
        }
        return null;
    }

    async synthesizeSpeech(text: string, mp3Output: string): Promise<void> {
        log.debug(f("say", `Creating request with text: ${text}`));
        const request = {
            input: { text: text },
            voice: {
                languageCode: "en-US",
                ssmlGender:
                    protos.google.cloud.texttospeech.v1.SsmlVoiceGender.FEMALE,
            },
            audioConfig: {
                audioEncoding:
                    protos.google.cloud.texttospeech.v1.AudioEncoding.MP3,
                volumeGainDb: 10.0,
                speakingRate: 0.85,
            },
        };

        log.debug(f("say", "Awaiting response..."));
        const [response] = await this.ttsClient.synthesizeSpeech(request);
        log.debug(f("say", "Response retrieved."));
        fs.writeFileSync(mp3Output, response.audioContent!, "binary");
        log.debug(f("say", "Audio content written to file: " + mp3Output));
    }
};
