import { Message } from "discord.js";
import { Command } from "../../custom/base";

const vibecheckCommand: Command = {
    name: "vibecheck",
    aliases: ["roll", "vc"],
    description: "Rolls a d20 to see how much we vibin'! ",
    arguments: [],
    enabled: true,
    async run(message: Message) {
        let response = `${Math.ceil(Math.random() * 20)}`;
        if (response === "20") {
            response = `${response} (~‾▿‾)~`;
        }
        message.reply(response);
        return null;
    },
};

export default vibecheckCommand;
