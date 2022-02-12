import { Collection } from "discord.js";
import { Command } from "../../../src/custom/base";
import leagueStatsCommand from "../../../src/commands/misc/opgg";

describe("Testing the league stats command", () => {
    describe("Testing the league stats command's run function", () => {
        const interaction = global["interaction"];
        const commands: Collection<string, Command> = global["testCommands"];
        const commandGroups: Collection<string, string[]> = global["testCommandGroups"];

        beforeEach(() => {
            jest.restoreAllMocks();
        });

        it("should send a message with the link to the OP.GG profile", async () => {
            const interactionSpy = jest.spyOn(interaction, "reply");

            const options = {
                username: "Username",
            };
            await leagueStatsCommand.run(interaction, options, commands, commandGroups);

            expect(interactionSpy).toHaveBeenCalledTimes(1);
            expect(interactionSpy).toHaveBeenLastCalledWith(
                "https://na.op.gg/summoner/userName=Username"
            );
        });
    });
});
