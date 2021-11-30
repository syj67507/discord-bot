import { Client, Guild, GuildMember } from "discord.js";
import { Argument, parseArgs } from "../../src/custom/base";
import * as validators from "../../src/custom/validators";
import { ArgumentCustomValidationError } from "../../src/errors/ArgumentCustomValidationError";
import { ArgumentDefinitionError } from "../../src/errors/ArgumentDefinitionError";
import { ArgumentUsageError } from "../../src/errors/ArgumentUsageError";

describe("Testing base.ts/parseArgs()", () => {
    let c: Client;
    let guild: Guild;
    beforeAll(() => {
        c = new Client();
        guild = new Guild(c, {});
        c.destroy();
    });

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("parseArgs should not have a side effect of altering parameters", async () => {
        const rawArgs = ["4"];
        const argumentsInfo: Argument[] = [
            {
                key: "key",
                type: "number",
                description: "description",
            },
        ];

        await parseArgs(rawArgs, argumentsInfo, guild);

        // rawArgs shouldn't have side effects
        expect(rawArgs).toEqual(["4"]);
        expect(argumentsInfo).toEqual([
            {
                key: "key",
                type: "number",
                description: "description",
            },
        ]);
    });

    it("parseArgs should get the number", async () => {
        const rawArgs = ["4"];
        const argumentsInfo: Argument[] = [
            {
                key: "key",
                type: "number",
                description: "description",
            },
        ];
        const expected = {
            full: "4",
            key: 4,
        };

        const result = await parseArgs(rawArgs, argumentsInfo, guild);
        expect(result).toEqual(expected);
    });

    it("parseArgs should get the string", async () => {
        const rawArgs = ["teststring"];
        const argumentsInfo: Argument[] = [
            {
                key: "key1",
                type: "string",
                description: "description",
            },
        ];

        const expected = {
            full: "teststring",
            key1: "teststring",
        };
        const result = await parseArgs(rawArgs, argumentsInfo, guild);

        expect(result).toEqual(expected);
    });

    it("parseArgs should get the boolean", async () => {
        const rawArgs = ["y", "n"];
        const argumentsInfo: Argument[] = [
            {
                key: "key1",
                type: "boolean",
                description: "description",
            },
            {
                key: "key2",
                type: "boolean",
                description: "description",
            },
        ];

        const expected = {
            full: "y n",
            key1: true,
            key2: false,
        };
        const result = await parseArgs(rawArgs, argumentsInfo, guild);

        expect(result).toEqual(expected);
    });

    it("parseArgs should get the user", async () => {
        const rawArgs = ["<@!123456789123456789>"];
        const argumentsInfo: Argument[] = [
            {
                key: "key1",
                type: "user",
                description: "description",
            },
        ];
        const guildMember = new GuildMember(c, {}, guild);

        // Mock the user/guildMember validator (requires connection)
        jest.spyOn(validators, "validateUser").mockImplementation(async () => {
            return guildMember;
        });

        const expected = {
            full: "<@!123456789123456789>",
            key1: guildMember,
        };
        const result = await parseArgs(rawArgs, argumentsInfo, guild);

        expect(result).toEqual(expected);
    });

    it("parseArgs should error when getting the number", async () => {
        const rawArgs = ["NaN"];
        const argumentsInfo: Argument[] = [
            {
                key: "key",
                type: "number",
                description: "description",
            },
        ];

        return expect(parseArgs(rawArgs, argumentsInfo, guild)).rejects.toThrowError(
            ArgumentUsageError
        );
    });

    it("parseArgs should error when getting the string", async () => {
        const rawArgs: string[] = [];
        const argumentsInfo: Argument[] = [
            {
                key: "key",
                type: "string",
                description: "description",
            },
        ];

        return expect(parseArgs(rawArgs, argumentsInfo, guild)).rejects.toThrowError(
            ArgumentUsageError
        );
    });

    it("parseArgs should error when getting the boolean", async () => {
        const rawArgs: string[] = ["notABoolean"];
        const argumentsInfo: Argument[] = [
            {
                key: "key",
                type: "boolean",
                description: "description",
            },
        ];

        return expect(parseArgs(rawArgs, argumentsInfo, guild)).rejects.toThrowError(
            ArgumentUsageError
        );
    });

    it("parseArgs should error when getting the user", async () => {
        const rawArgs = ["<@!invalidId>"];
        const argumentsInfo: Argument[] = [
            {
                key: "key1",
                type: "user",
                description: "description",
            },
        ];

        // Mock the user/guildMember validator (requires connection)
        jest.spyOn(validators, "validateUser").mockImplementation(async () => {
            return undefined;
        });

        return expect(parseArgs(rawArgs, argumentsInfo, guild)).rejects.toThrowError(
            ArgumentUsageError
        );
    });

    it("parseArgs should place extra values in remaining", async () => {
        const rawArgs = ["firstvalue", "secondvalue"];
        const argumentsInfo: Argument[] = [
            {
                key: "key1",
                type: "string",
                description: "description",
            },
        ];

        const expected = {
            full: "firstvalue secondvalue",
            key1: "firstvalue",
            remaining: "secondvalue",
        };
        const result = await parseArgs(rawArgs, argumentsInfo, guild);
        expect(result).toEqual(expected);
    });

    it("parseArgs should error if there are duplicate keys", async () => {
        const rawArgs: string[] = [];
        const argumentsInfo: Argument[] = [
            {
                key: "duplicatekey",
                type: "string",
                description: "description",
            },
            {
                key: "duplicatekey",
                type: "string",
                description: "description",
            },
        ];
        return expect(parseArgs(rawArgs, argumentsInfo, guild)).rejects.toThrowError(
            ArgumentDefinitionError
        );
    });

    it("parseArgs should error if keys are using reserved keywords", async () => {
        const rawArgs: string[] = [];
        const argumentsInfo: Argument[] = [
            {
                key: "full",
                type: "string",
                description: "description",
            },
            {
                key: "remaining",
                type: "string",
                description: "description",
            },
        ];

        return expect(parseArgs(rawArgs, argumentsInfo, guild)).rejects.toThrowError(
            ArgumentDefinitionError
        );
    });

    it("parseArgs should use the validator and return successfully", async () => {
        const rawArgs = ["5"];
        const argumentsInfo: Argument[] = [
            {
                key: "key1",
                type: "number",
                description: "description",
                validator: (value) => value === 5,
            },
        ];
        const expected = {
            full: "5",
            key1: 5,
        };
        const result = await parseArgs(rawArgs, argumentsInfo, guild);
        expect(result).toEqual(expected);
    });

    it("parseArgs should use the validator and throw error when validator fails", async () => {
        const rawArgs = ["5"];
        const argumentsInfo: Argument[] = [
            {
                key: "key1",
                type: "number",
                description: "description",
                validator: (value) => value !== 5,
            },
        ];

        return expect(parseArgs(rawArgs, argumentsInfo, guild)).rejects.toThrowError(
            ArgumentCustomValidationError
        );
    });

    it("parseArgs should use the default value", async () => {
        const rawArgs: string[] = [];
        const argumentsInfo: Argument[] = [
            {
                key: "key1",
                type: "number",
                description: "description",
                default: 5,
            },
        ];

        const expected = {
            full: "",
            key1: 5,
        };
        const result = await parseArgs(rawArgs, argumentsInfo, guild);
        expect(result).toEqual(expected);
    });

    it("parseArgs should error if default value doesn't match type", async () => {
        const rawArgs: string[] = [];
        const argumentsInfo: Argument[] = [
            {
                key: "key1",
                type: "number",
                description: "description",
                default: "not a number",
            },
        ];

        return expect(parseArgs(rawArgs, argumentsInfo, guild)).rejects.toThrowError(
            ArgumentUsageError
        );
    });

    it("parseArgs should error if default value doesn't exist and no value is passed", async () => {
        const rawArgs: string[] = [];
        const argumentsInfo: Argument[] = [
            {
                key: "key1",
                type: "number",
                description: "description",
            },
        ];

        return expect(parseArgs(rawArgs, argumentsInfo, guild)).rejects.toThrowError(
            ArgumentUsageError
        );
    });

    it("parseArgs should parse an array of values when infinite is true", async () => {
        const rawArgs = ["4"];
        const argumentsInfo: Argument[] = [
            {
                key: "key",
                type: "number",
                description: "description",
                infinite: true,
            },
        ];
        const expected = {
            full: "4",
            key: [4],
        };

        const result = await parseArgs(rawArgs, argumentsInfo, guild);
        expect(result).toEqual(expected);
    });

    it("parseArgs should error if the infinite flag is true for any argument that isn't the last", async () => {
        const rawArgs = ["1", "2", "string"];
        const argumentsInfo: Argument[] = [
            {
                key: "first",
                type: "number",
                description: "description",
                infinite: true,
            },
            {
                key: "second",
                type: "string",
                description: "description",
            },
        ];

        return expect(parseArgs(rawArgs, argumentsInfo, guild)).rejects.toThrowError(
            ArgumentDefinitionError
        );
    });
});
