// Mock the loaded commands nested in this folder
// These loaded commands are intended to be used inside of unit tests
import { loadCommands } from "../custom/loadCommands";
export const { commands, commandAliases, commandGroups } = loadCommands(__dirname);
