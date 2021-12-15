// import { Message } from "discord.js";
// import { Command } from "../../custom/base";
// import { format as f, logger as log } from "../../custom/logger";
// import MusicManager from "../../custom/music-manager";

// const nextCommand: Command = {
//     name: "next",
//     aliases: ["skip"],
//     description: "Plays the next song in the queue.",
//     enabled: true,
//     arguments: [],
//     async run(message: Message): Promise<null> {
//         const mm = MusicManager.getInstance(message.client);
//         log.debug(f("next", `Queue length: ${mm.queueLength()}`));
//         if (mm.queueLength() < 1) {
//             message.reply("There are no tracks in the queue.");
//             return null;
//         }
//         try {
//             if (!mm.isPlaying()) {
//                 log.debug(f("next", "Not playing. Connecting..."));
//                 await mm.connect(message.member!.voice.channel);
//                 log.debug(f("next", "Connected."));
//             }
//             mm.play(message);
//         } catch (error) {
//             log.error(error);
//             message.reply("Unable to skip to next song.");
//         }
//         return null;
//     },
// };

// export default nextCommand;
