console.log("running v12 standard");
import { Client, Collection } from "discord.js";
import "dotenv/config";

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
    console.log(
        "this message started with the command prefix",
        message.content
    );

    const meowCommand = (await import("./commands/misc/meow")).default;
    console.log("asdf");
    await meowCommand.run(message, {});
    console.log("asdf");
});

client.login(token);
