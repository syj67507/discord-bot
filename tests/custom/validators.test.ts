import { Client, Guild, GuildMember } from "discord.js";
import {
    validateBoolean,
    validateNumber,
    validateUser,
} from "../../src/custom/validators";

describe("validateNumber", () => {
    it("validateNumber should parse and return the number if a number is passed", () => {
        const value = "0";
        const result = validateNumber(value);
        const expected = 0;
        expect(result).toBe(expected);
    });

    it("validateNumber should parse and return the negative number if a negative number is passed", () => {
        const value = "-1";
        const result = validateNumber(value);
        const expected = -1;
        expect(result).toBe(expected);
    });

    it("validateNumber should return undefined if a number is not passed", () => {
        const value = "not a number";
        const result = validateNumber(value);
        const expected = undefined;
        expect(result).toBe(expected);
    });
});

describe("validateBoolean", () => {
    it("validateBoolean should parse and return the boolean similar value as a boolean", () => {
        const truthyValues = ["1", "yes", "y", "true"];
        const falsyValues = ["0", "no", "n", "false"];
        for (const truthyValue of truthyValues) {
            const result = validateBoolean(truthyValue);
            const expected = true;
            expect(result).toBe(expected);
        }
        for (const falsyValue of falsyValues) {
            const result = validateBoolean(falsyValue);
            const expected = false;
            expect(result).toBe(expected);
        }
    });

    it("validateNumber should return undefined if a boolean similar value is not passed", () => {
        const value = "not a boolean";
        const result = validateBoolean(value);
        const expected = undefined;
        expect(result).toBe(expected);
    });
});

describe("validateUser", () => {
    let guild: Guild;
    let mockGuild: any;
    beforeAll(() => {
        const c = new Client();
        guild = new Guild(c, {});
        c.destroy();

        mockGuild = {
            members: {
                fetch: (): any => {
                    return new GuildMember(c, {}, guild);
                },
            },
        };
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("validateUser should parse and return the user as a guildMember", async () => {
        const value = "<@!123456789123456789>";
        const spyOnMemberFetch = jest.spyOn(mockGuild.members, "fetch");

        const result = await validateUser(value, mockGuild);
        expect(result).toBeInstanceOf(GuildMember);
        expect(spyOnMemberFetch).toHaveBeenCalledWith("123456789123456789");
    });

    it("validateNumber should return undefined if an invalid id was passed", async () => {
        const value = "<@!invalidId>";
        const spyOnMemberFetch = jest.spyOn(mockGuild.members, "fetch");

        const result = await validateUser(value, mockGuild);
        expect(result).toBeUndefined();
        expect(spyOnMemberFetch).not.toHaveBeenCalled();
    });
});
