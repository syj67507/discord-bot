import { Collection } from "discord.js";

export class KillIntervals {
    constructor() {}
    private static db: Collection<string, NodeJS.Timer>;
    static getInstance(): Collection<string, NodeJS.Timer> {
        if (!KillIntervals.db) {
            KillIntervals.db = new Collection<string, NodeJS.Timer>();
        }
        return KillIntervals.db;
    }
}
