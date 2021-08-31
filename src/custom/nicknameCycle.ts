import { Client } from "discord.js-commando";
import "dotenv/config";

const hour = 3600000;
let lastDateChanged: Date = new Date();
const guildId = process.env.DEV_GUILD_ID || "665419154890817567";
const clientId = process.env.DEV_CLIENT_ID || "705916871605747733";

const names: string[] = [
    "Imran Rahman",
    "Jacob Yu",
    "Brandon Nguyen",
    "Nicholas Colin Kemme",
    "Fahad Islam",
    "Fahim Zaman",
    "Shams Jamal",
    "Ishmam Mahmud",
];

export function setNicknameCycle(client: Client) {
    client.setInterval(async () => {
        // Check if it is time to change the nickname
        const d: Date = new Date();
        console.log(d.toUTCString());
        if (lastDateChanged.getUTCDate() === d.getUTCDate()) {
            return; // Don't change nickname yet
        }
        lastDateChanged = d;

        // Fetch the client as a guildMember
        const guild = await client.guilds.fetch(guildId);
        const guildMember = await guild.members.fetch(clientId);

        // Find index of current nickname and set
        let index = names.findIndex((name) => {
            return name === guildMember.nickname;
        });
        if (index === -1) {
            index = Math.floor(Math.random() * names.length);
        } else {
            index = index === names.length - 1 ? 0 : (index += 1); // Rolls back to the beginning
        }
        await guildMember.setNickname(names[index]);
    }, hour);
}
