import { CommandoClient } from "discord.js-commando";
import MusicManager from "./custom/music-manager";
import path from "path";
import fs from "fs";
import registerGCP from "./custom/register-gcp";
import { setNicknameCycle } from "./custom/nicknameCycle";

require("dotenv").config();
const prefix: any = process.env.PREFIX;
const token: any = process.env.TOKEN;

registerGCP(); // Register GCP credentials (for Text-to-Speech)

const client: CommandoClient = new CommandoClient({
    commandPrefix: prefix,
    owner: "108726505688862720", // @Bonk#9304
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

setNicknameCycle(client); // Cycles the client's nickname once every day
