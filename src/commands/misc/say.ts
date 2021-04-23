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
                },
            ],
            argsPromptLimit: 0,
        });
        this.ttsClient = new texttospeech.TextToSpeechClient();
    }

    async run(message: CommandoMessage, args: any) {
        // Return error if the input is too long
        if (args.text.length > 100) {
            return message.reply([
                "You've given too many characters.",
                "There is a 100 character limit",
            ]);
        }

        // Errors if music is being played
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
            await mm.connect(message.member?.voice.channel!);
            const sayTrack = mm.createTrackFromMP3("SayCmd Output", file);
            mm.queue(sayTrack, 0);
            mm.play(message);
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
