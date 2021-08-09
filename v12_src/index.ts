console.log("running v12 standard");
import { Client } from "discord.js";
import "dotenv/config";

const client = new Client();
const token = process.env.TOKEN;
const prefix = process.env.PREFIX || "!";
client.on("ready", () => {
    console.log(`Logged in ${client?.user?.id} as ${client?.user?.tag}`);
});

client.on("message", (message) => {
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
});

client.login(token);
