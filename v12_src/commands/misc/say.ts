import { Message } from "discord.js";
import { ArgumentValues, Command } from "../../custom/base";
import texttospeech from "@google-cloud/text-to-speech";
import * as protos from "@google-cloud/text-to-speech/build/protos/protos";
import MusicManager from "../../custom/music-manager";
import { logger as log, format as f } from "../../custom/logger";
import fs from "fs";

const sayCommand: Command = {
    name: "say",
    description: "Takes some text and synthesizes speech to the voice channel.",
    aliases: ["tts", "texttospeech", "text-to-speech"],
    enabled: true,
    arguments: [{
        key: "text",
        type: "strings",
        description: "The text to convert to speech"
    }],
    async run(message: Message, args: ArgumentValues) {
        const text = args.text as string;
        message.channel.send(`Say! ${text}`);

        const mm = MusicManager.getInstance(message.client);
        if (mm.isPlaying()) {
            message.reply(
                "You must first stop playing music before calling this command."
            );
            return null;
        }

        const file = "media/say.mp3";
        try {
            await synthesizeSpeech(text, file);
        } catch (error) {
            log.error(f("say", "Error in synthesizing speech"));
            if (error instanceof Error) {
                log.error(f("say", error.message));
            } else {
                log.error(f("say", "Unknown error."));
            }
            message.reply(
                "There was problem in speech synthesis. Try again later."
            );
            return null;
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
            if (error instanceof Error) {
                log.error(f("say", error.message));
            } else {
                log.error(f("say", "Unknown error."));
            }
            message.reply([
                "An error occurred.",
                "Make sure to be in a voice channel before calling this command.",
                "If errors still continue, contact the bot admin: " +
                    `@Bonk`,
            ]);
            return null;
        }
        
        return null;
    },
};

async function synthesizeSpeech(text: string, mp3Output: string): Promise<void> {
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
    const [response] = await new texttospeech.TextToSpeechClient().synthesizeSpeech(request);
    log.debug(f("say", "Response retrieved."));
    fs.writeFileSync(mp3Output, response.audioContent!, "binary");
    log.debug(f("say", "Audio content written to file: " + mp3Output));
}

export default sayCommand;
