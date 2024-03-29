import leagueStatsCommand, {
    searchLeagueName,
} from "../../../v12_src/commands/misc/leaguestats";

describe("Testing the league stats command", () => {
    describe("Testing league stats' helper functions", () => {
        it("should create an URL to OP.GG with the given username", () => {
            const username = "Username";
            const result = searchLeagueName(username);
            expect(result).toBeInstanceOf(URL);
            expect(result.href).toBe("https://na.op.gg/summoner/userName=Username");
        });
    });

    describe("Testing the league stats command's run function", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

        const message: any = {
            channel: {
                send: jest.fn(),
            },
        };
        it("should send a message with the link to the OP.GG profile", async () => {
            const messageSpy = jest.spyOn(message.channel, "send");

            const args = {
                leagueUsernameInput: "Username",
            };
            const result = await leagueStatsCommand.run(message, args);
            expect(result).toBeNull();
            expect(messageSpy).toHaveBeenCalledTimes(1);
            expect(messageSpy).toHaveBeenLastCalledWith(
                "https://na.op.gg/summoner/userName=Username"
            );
        });
    });
});
