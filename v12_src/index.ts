console.log("running v12 standard");
import { Client, Collection } from "discord.js";
import "dotenv/config";
import { parseArgs } from "./commands/base";

const client = new Client();
const token = process.env.TOKEN;
const prefix = process.env.PREFIX || "!";
client.on("ready", () => {
    console.log(`Logged in ${client?.user?.id} as ${client?.user?.tag}`);
});

client.on("message", async (message) => {
    if (message.author.bot) {
        return;
    }
    if (!message.content.startsWith(prefix)) {
        return;
    }

    // Parse through message.content
    const rawArgs = message.content.slice(prefix.length).split(/[ ]+/);
    const command = rawArgs.shift();

    console.log("command", command);
    console.log("rawArgs", rawArgs);

    const meowCommand = (await import(`./commands/misc/${command}`)).default;

    const args = parseArgs(rawArgs, meowCommand.arguments);

    await meowCommand.run(message, args);
});

client.login(token);
