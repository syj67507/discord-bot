// import {
//     Client,
//     Message,
//     StreamDispatcher,
//     VoiceChannel,
//     VoiceConnection,
//     VoiceState,
// } from "discord.js";
// import ytdl from "ytdl-core";
// import { logger as log, format as f } from "./logger";

export interface Track {
    title: string;
    link: string;
    duration: string | null;
}

// export default class MusicManager {
//     private static instance: MusicManager;
//     static getInstance(client: Client): MusicManager {
//         if (!MusicManager.instance) {
//             MusicManager.instance = new MusicManager(client);
//         }
//         return MusicManager.instance;
//     }

//     playlist: Track[];
//     private client: Client;
//     private voiceChannel: VoiceChannel | null;
//     private voiceConnection: VoiceConnection | null;
//     private dispatcher: StreamDispatcher | null;
//     private constructor(client: Client) {
//         this.playlist = [];
//         this.client = client;
//         this.voiceChannel = null;
//         this.voiceConnection = null;
//         this.dispatcher = null;

//         // Handles manager's property values on voice state changes
//         this.client.on(
//             "voiceStateUpdate",
//             (oldState: VoiceState, newState: VoiceState) => {
//                 if (newState.member!.user.bot) {
//                     if (newState.channel === null) {
//                         this.voiceChannel = null;
//                         this.voiceConnection = null;
//                         this.dispatcher = null;
//                     } else {
//                         this.voiceChannel = newState.channel;
//                         this.voiceConnection = newState.connection;
//                     }
//                     console.log("debug: MUSICMANAGER - Voice Updated:");
//                     console.log(
//                         "debug: MUSICMANAGER - Voice Channel:",
//                         this.voiceChannel?.id
//                     );
//                     console.log(
//                         "debug: MUSICMANAGER - Voice Connection:",
//                         this.voiceConnection !== null
//                     );
//                 }
//             }
//         );
//     }

//     /**
//      * Adds a track to the queue/playlist. By default, the track is added
//      * at the end. This is configurable using the position parameter.
//      *
//      * @param {Track} track Track object
//      * @param {number} position The position where in playlist to add the track.
//      * To add to the beginning, set this parameter to 0.
//      */
//     queue(track: Track, position: number = this.queueLength()): void {
//         this.playlist.splice(position, 0, track);
//     }

// /**
//  * Takes current playlist and shuffles it.
//  * If playlist is empty, then command returns a message saying
//  * it cannot shuffle an empty playlist.
//  */
//  shuffle(): void {
//     for (let i = this.playlist.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
//     }
// }

//     /**
//      * Returns the number of tracks left in the queue.
//      */
//     queueLength(): number {
//         return this.playlist.length;
//     }

//     /**
//      * Returns an array of strings that represent a preview of what is in
//      * the queued playlist.
//      */
//     getQueuePreview(): string[] {
//         let queuedPreview = this.playlist.map(
//             (track, index) => `${index + 1}. ${track.title}`
//         );
//         if (queuedPreview.length > 5) {
//             queuedPreview = [
//                 ...queuedPreview.slice(0, 3),
//                 "...",
//                 ...queuedPreview.slice(-1),
//             ];
//         }
//         return queuedPreview;
//     }

//     /**
//      * Resets to the queue to be empty.
//      */
//     clearQueue(): void {
//         this.playlist = [];
//     }

//     /**
//      * Returns true if the manager is currently playing music.
//      */
//     isPlaying(): boolean {
//         return this.dispatcher !== null;
//     }

//     /**
//      * Connects the bot to the voice channel that the user is currently in
//      *
//      * @param {Discord.Message} message Message sent by the user to use a command
//      */
//     async connect(channel: VoiceChannel | null): Promise<void> {
//         // Check if the user is in a voice channel
//         if (channel == null) {
//             throw new Error(`Unable to join voice channel: ${channel}`);
//         }

//         // Attempts to connect
//         try {
//             await channel.join();
//         } catch (error) {
//             log.error(f("MUSICMANAGER", `Error in joining channel ${channel}`));
//             throw error;
//         }
//     }
//     /**
//      * Disconnects the bot from the voice channel gracefully.
//      */
//     disconnect(): void {
//         if (this.voiceChannel) {
//             this.voiceChannel.leave();
//         }
//     }

//     /**
//      * Plays the next song found within the client's playlist and sends a message to the
//      * text channel providing what it is playing. This function is called recursively until there
//      * are no more song in the playlist. Once finished, the client will leave the voice channel.
//      *
//      * Any playback errors that are thrown within the dispatcher will be caught and logged.
//      *
//      * @param {Discord.Message} message The message that invoked this command.
//      */
//     play(message: Message): void {
//         // Validation checks before playing
//         if (!this.voiceChannel || !this.voiceConnection) {
//             throw new Error(
//                 "Music Manager not connected. Must be connected in order to play"
//             );
//         }

//         // Plays the next song in the queue
//         const track = this.playlist.shift();
//         if (!track) {
//             throw new Error("Queue is empty.");
//         }
//         const playback = ytdl(track.link, {
//             filter: "audioonly",
//             quality: "highestaudio",
//         });
//         this.dispatcher = this.voiceConnection!.play(playback);

//         this.dispatcher.on("start", () => {
//             log.debug(f("dispatcher", "Now Playing..."));
//             message.channel.send(
//                 `:notes: Now Playing: [${track!.duration}] *${track!.title}*`
//             );
//         });

//         // Plays the next song or leaves if there isn't one
//         this.dispatcher.on("finish", () => {
//             log.debug(f("dispatcher", "Song has finished."));
//             log.debug(f("dispatcher", "Songs left in queue: " + this.queueLength()));

//             if (this.playlist.length > 0) {
//                 log.debug(f("dispatcher", "Fetching next song in queue..."));
//                 this.play(message);
//             } else {
//                 log.debug(f("dispatcher", "No more songs left in queue."));
//                 message.channel.send(
//                     "No more songs left in queue. You can add more by using the `queue` command"
//                 );
//                 this.disconnect();
//                 log.debug(f("dispatcher", "Left the voice channel."));
//             }
//         });

//         this.dispatcher.on("error", (error) => {
//             message.reply(["There was a playback error.", "A restart is recommended."]);
//             log.debug(f("dispatcher", `${error}`));
//             this.disconnect();
//             log.debug(f("play", "Left the voice channel."));
//         });
//     }
// }
