import { Client } from "discord.js";
import "dotenv/config";
import { logger as log, format as f } from "./logger";

const nicknameRegistry: {
    [key: string]: {
        lastDateChanged: Date;
        interval: NodeJS.Timeout;
    };
} = {};

/**
 * Sets an interval to change the nickname of this bot on a specified guild.
 * How often this interval will check to change depends on the checkDelayInMilliseconds
 * parameter
 *
 * @param client The client that represents the bot
 * @param guildId The guild/server of where to change this client's/bot's nickname
 * @param nicknames An array of nicknames for which the name should be changed to
 * @param checkDelayInMilliseconds How often it should check to see if it is time to change
 * its nickname
 */
export function setNicknameCycle(
    client: Client,
    guildId: string,
    nicknames: string[],
    checkDelayInMilliseconds: number
): void {
    nicknameRegistry[guildId] = {
        lastDateChanged: new Date(),
        interval: client.setInterval(async () => {
            try {
                // Check if it is time to change the nickname
                const d: Date = new Date();
                if (
                    nicknameRegistry[guildId]?.lastDateChanged?.getUTCDate() ===
                    d.getUTCDate()
                ) {
                    return; // Don't change nickname yet
                }
                // Fetch the client as a guildMember
                const guild = await client.guilds.fetch(guildId);
                const guildMember = await guild.members.fetch(client!.user!.id!);

                // Find index of current nickname and set
                let index = nicknames.findIndex((name) => {
                    return name === guildMember.nickname;
                });
                if (index === -1) {
                    index = Math.floor(Math.random() * nicknames.length);
                } else {
                    index = index === nicknames.length - 1 ? 0 : (index += 1); // Rolls back to the beginning
                }

                // Update
                log.info(f("NICKNAME", `${guildId} - Updating...`));
                await guildMember.setNickname(nicknames[index]);
                nicknameRegistry[guildId].lastDateChanged = d;
                log.info(
                    f("NICKNAME", `${guildId} - Nickname changed to: ${nicknames[index]}`)
                );
            } catch (error) {
                log.error(f("NICKNAME", `${guildId} - ${(error as Error).message}`));
                log.error(f("NICKNAME", "Clearing interval..."));
                client.clearInterval(nicknameRegistry[guildId].interval);
                log.error(f("NICKNAME", "Cleared."));
            }
        }, checkDelayInMilliseconds),
    };
}
