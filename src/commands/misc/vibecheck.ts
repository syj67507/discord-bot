import {
    CommandoMessage,
    Command,
    CommandoClient,
    ArgumentInfo,
} from "discord.js-commando";
import { logger as log, format as f } from "../../custom/logger";

module.exports = class PokemondCommand extends (
    Command
) {
    constructor(client: CommandoClient) {
        super(client, {
            name: "vibecheck",
            aliases: ["roll", "vc"],
            group: "misc",
            memberName: "vibecheck",
            description: "See how much we vibin'!",
        });
    }

    async run(message: CommandoMessage) {
        let response = `${Math.ceil(Math.random() * 20)}`;
        if (response === "20") {
            response = `${response} (~‾▿‾)~`;
        }
        return message.reply(response);
    }
};
