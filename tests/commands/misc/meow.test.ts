import { Collection } from "discord.js";
import { Command } from "../../../src/custom/base";
import meowCommand from "../../../src/commands/misc/meow";

describe("Testing the meow command", () => {
    describe("Testing the meow command's run function", () => {
        const interaction = global["interaction"];
        const commands: Collection<string, Command> = global["testCommands"];
        const commandGroups: Collection<string, string[]> = global["testCommandGroups"];

        it("should respond with meow", async () => {
            const interactionSpy = jest.spyOn(interaction, "reply");

            const options: any = {};
            const result = await meowCommand.run(
                interaction,
                options,
                commands,
                commandGroups
            );

            expect(result).toBeNull();
            expect(interactionSpy).toHaveBeenCalledTimes(1);
            expect(interactionSpy).toHaveBeenLastCalledWith("Meow!");
        });
    });
});
