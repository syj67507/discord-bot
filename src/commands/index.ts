import { BaseCommand } from "./base-command";
import { PingCommand } from "./ping.command";

/**
 * A map holding all commands defined for this application
 *
 * The key is the name of the command and the value is going to be the
 * class definition that can be instantiated
 */
export const commands = new Map<string, typeof BaseCommand>();

commands.set(PingCommand.registrationData.name, PingCommand);
