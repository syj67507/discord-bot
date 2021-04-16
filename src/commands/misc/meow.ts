import { CommandoMessage, Command, CommandoClient } from "discord.js-commando";

module.exports = class MeowCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "meow",
            group: "misc",
            memberName: "meow",
            description: "Replies with a meow, kitty cat.",
        });
    }

    run(message: CommandoMessage) {
        return message.say("Meow!");
    }
};
