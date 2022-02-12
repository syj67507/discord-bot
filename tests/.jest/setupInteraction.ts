import { Collection } from "discord.js";
const rolesCache: Collection<any, any> = new Collection();
rolesCache.set("everyoneRole", {
    name: "@everyone",
    id: "everyoneRoleId",
});

/**
 * This object mocks the API data of an ApplicationCommand.
 * Allows for manipulation of a command's permissions for usage
 *
 * @external https://discord.js.org/#/docs/discord.js/stable/class/ApplicationCommand
 */
const applicationCommandCache = new Collection<string, any>();
const applicationCommand = {
    permissions: {
        has: jest.fn(),
        remove: jest.fn(),
        set: jest.fn(),
    },
};
applicationCommandCache.set("applicationCommandId", applicationCommand);

/**
 * This object mocks the API data of a CommandInteraction.
 *
 * @external https://discord.js.org/#/docs/discord.js/stable/class/CommandInteraction
 */
const interaction: any = {
    reply: jest.fn(),
    deferReply: jest.fn(),
    editReply: jest.fn(),
    followUp: jest.fn(),
    channel: {
        send: jest.fn(),
        awaitMessages: jest.fn(),
    },
    member: { permissions: { has: jest.fn() }, user: {} },
    guild: {
        commands: {
            cache: { find: () => undefined },
            fetch: () => {
                return {
                    find: () => applicationCommand,
                };
            },
        },
        roles: { cache: rolesCache },
    },
};

global["interaction"] = interaction;
global["applicationCommand"] = applicationCommand;
