import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import { commands } from "./commands";
import { config } from "./config";

export async function registerCommands() {
  // Construct and prepare an instance of the REST module
  const rest = new REST().setToken(config.token);
  const commandsData: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
  commands.forEach((command) => {
    commandsData.push(command.registrationData.toJSON());
  });

  try {
    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commandsData },
    );

    console.log(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      `Successfully reloaded ${(data as any).length} application (/) commands.`,
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
}
