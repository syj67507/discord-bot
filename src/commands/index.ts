import { PingCommand } from "./ping.command";
import { PlayCommand } from "./music/play.command";
import { StopCommand } from "./music/stop.command";

/**
 * A map holding all commands defined for this application
 *
 * The key is the name of the command and the value is going to be the
 * class definition that can be instantiated
 *
 * `any` is used here because dependency injection can't guarantee that all commands will have the same constructor pattern.
 * The workaround is to explicitly type the value of the key/value pair of this map to BaseCommand wherever used in this application
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const commands = new Map<string, any>();

commands.set(PingCommand.registrationData.name, PingCommand);
commands.set(PlayCommand.registrationData.name, PlayCommand);
commands.set(StopCommand.registrationData.name, StopCommand);
