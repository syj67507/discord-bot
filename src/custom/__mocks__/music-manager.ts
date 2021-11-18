import { Client } from "discord.js";
// const ActualMusicManager = jest.requireActual("../music-manager");

export default class MusicManager {
    private static instance: MusicManager;
    constructor(client: Client) {
        client;
    }
    static getInstance(client: Client): MusicManager {
        if (!MusicManager.instance) {
            MusicManager.instance = new MusicManager(client);
        }
        return MusicManager.instance;
    }

    playlist = [];

    isPlaying(): boolean {
        return false;
    }

    queueLength(): number {
        return this.playlist.length;
    }
}
