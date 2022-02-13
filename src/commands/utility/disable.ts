import { Collection, CommandInteraction, Permissions, Role } from "discord.js";
import { Command, OptionType } from "../../custom/base";

const disableCommand: Command = {
    name: "disable",
    description: "Disables a command from being used",
    enabled: true,
    options: [
        {
            name: "command",
            description: "The command to disable",
            type: OptionType.String,
            required: true,
        },
    ],
    async run(
        interaction: CommandInteraction,
        options: any,
        commands: Collection<string, Command>,
        commandGroups: Collection<string, string[]>
    ) {
        // Check if user has permissions to use this command
        if (
            !(interaction.member!.permissions as Permissions).has(
                Permissions.FLAGS.ADMINISTRATOR
            )
        ) {
            interaction.reply("You do not have permissions to disable commands.");
            return null;
        }

        const commandName = options.command as string;

        // Check to see if command exists
        if (commands.has(commandName) === false) {
            interaction.reply(`Unable to disable: \`${options.command}\` not found.`);
            return null;
        }

        // Check if the command is a utiliy command
        // (not allowed to disable utility commands)
        if (commandGroups.get("utility")!.includes(commandName)) {
            interaction.reply("Can't disable a utility command.");
            return null;
        }

        // Command exists, get definition
        const everyoneGuildRole = interaction.guild?.roles.cache.find(
            (role: Role) => role.name === "@everyone"
        );
        let command = interaction.guild?.commands.cache.find((cmd) => {
            return cmd.name === commandName;
        });
        if (!command) {
            console.log("FETCHING");
            command = (await interaction.guild?.commands.fetch())!.find((cmd) => {
                return cmd.name === commandName;
            });
        }

        // Check if it is already enabled
        const disabled = await command!.permissions.has({
            permissionId: everyoneGuildRole!.id,
        });
        if (disabled === true) {
            interaction.reply(`\`${commandName}\` is already disabled.`);
            return null;
        }

        // Disable
        await command?.permissions.set({
            permissions: [
                {
                    id: everyoneGuildRole!.id,
                    type: "ROLE",
                    permission: false,
                },
            ],
        });

        interaction.reply(`\`${commandName}\` disabled.`);
        const cmd = commands.get(commandName)!;
        cmd.enabled = false;
        return null;
    },
};

export default disableCommand;
