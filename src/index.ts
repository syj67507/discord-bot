import { CommandoClient } from "discord.js-commando";
import MusicManager from "./custom/music-manager";
import path from "path";
import fs from "fs";

require("dotenv").config();
const prefix: any = process.env.PREFIX;
const token: any = process.env.TOKEN;
const googleApplicationCredentialsJson: any =
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
fs.writeFileSync("creds.json", googleApplicationCredentialsJson);

const client: CommandoClient = new CommandoClient({
    commandPrefix: prefix,
    owner: "108726505688862720",
});

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ["misc", "Miscellaneous Commands"],
        ["troll", "Troll Commands"],
        ["music", "Music Player Commands"],
    ])
    .registerDefaultGroups()
    .registerDefaultCommands({ eval: false })
    .registerCommandsIn(path.join(__dirname, "commands"));

client.once("ready", () => {
    console.log(`Logged in as ${client?.user?.tag}! (${client?.user?.id})`);
    client?.user?.setActivity("with Commando");
});
client.login(token);

MusicManager.getInstance(client); // Initializing the music manager

// Cycling through legal names on No Hands Server
// Checks every hour
let lastDateChanged: Date = new Date();
client.setInterval(async () => {
    // Check if it is time to change the nickname
    const d: Date = new Date();
    console.log(d.toUTCString());
    if (lastDateChanged.getUTCDate() === d.getUTCDate()) {
        return;
    }
    lastDateChanged = d;

    const names: string[] = [
        "Imran Rahman",
        "Brandon Nyguen",
        "Jacob Yu",
        "Nicholas Colin Kemme",
        "Fahad Islam",
        "Fahim Zaman",
        "Shams Jamal",
        "Ishmam Mahmud",
    ];

    // Fetch the client as a guildMember
    const noHandsGuildId = "665419154890817567";
    const clientId = "705916871605747733";
    const guild = await client.guilds.fetch(noHandsGuildId);
    const guildMember = await guild.members.fetch(clientId);

    // Find index of current nickname and set
    let index = names.findIndex((name) => {
        return name === guildMember.nickname;
    });
    if (index === -1) {
        index = Math.floor(Math.random() * names.length);
    } else {
        index = index === 7 ? 0 : (index += 1); // Rolls back to the beginning
    }
    await guildMember.setNickname(names[index]);
}, 3600000);
