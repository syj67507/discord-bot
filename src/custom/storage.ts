import { Collection } from "discord.js";

export class KillIntervals {
    private constructor() {
        // Do nothing
    }
    private static db: Collection<string, NodeJS.Timer>;
    /**
     * Returns an instance of the KillIntervals database
     * The database is a Collection of users and their associated
     * NodeJS.Timer intervals.
     *
     * @returns KillIntervals.db - database
     */
    static getInstance(): Collection<string, NodeJS.Timer> {
        if (!KillIntervals.db) {
            KillIntervals.db = new Collection<string, NodeJS.Timer>();
        }
        return KillIntervals.db;
    }
}
