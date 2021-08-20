import { Client, Guild } from "discord.js";
import { Argument, parseArgs } from "../v12_src/custom/base";

describe("this is a.test", () => {
    it("should be true", () => {
        expect(true).toBe(true);
    });

    it("should test parseArgs", async () => {
        const rawArgs = ["4"];
        const argumentsInfo: Argument[] = [
            {
                key: "key",
                type: "number",
                description: "description",
            },
        ];
        const c = new Client();
        const guild: Guild = new Guild(c, {});
        const result = await parseArgs(rawArgs, argumentsInfo, guild);
        const expected = {
            full: "4",
            key: 4,
        };
        expect(result).toEqual(expected);
        expect(rawArgs).toEqual(["4"]);
        c.destroy();
        return expect(parseArgs(rawArgs, argumentsInfo, guild)).resolves.toEqual(
            expected
        );
    });
});
