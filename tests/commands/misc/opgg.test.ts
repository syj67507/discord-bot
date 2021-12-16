import leagueStatsCommand from "../../../src/commands/misc/opgg";

describe("Testing the league stats command", () => {
    describe("Testing the league stats command's run function", () => {
        const interaction: any = {
            reply: jest.fn(),
        };

        beforeEach(() => {
            jest.restoreAllMocks();
        });

        it("should send a message with the link to the OP.GG profile", async () => {
            const interactionSpy = jest.spyOn(interaction, "reply");

            const args = {
                username: "Username",
            };
            await leagueStatsCommand.run(interaction, args);

            expect(interactionSpy).toHaveBeenCalledTimes(1);
            expect(interactionSpy).toHaveBeenLastCalledWith(
                "https://na.op.gg/summoner/userName=Username"
            );
        });
    });
});
