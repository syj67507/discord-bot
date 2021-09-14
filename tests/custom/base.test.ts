import { Client, Guild, GuildMember } from "discord.js";
import { Argument, parseArgs } from "../../v12_src/custom/base";
import { ArgumentCustomValidationError } from "../../v12_src/errors/ArgumentCustomValidationError";
import { ArgumentRuntimeError } from "../../v12_src/errors/ArgumentRuntimeError";
import { ArgumentUsageError } from "../../v12_src/errors/ArgumentUsageError";

describe("Testing base.ts/parseArgs()", () => {
    let c: Client;
    let guild: Guild;
    beforeAll(() => {
        c = new Client();
        guild = new Guild(c, {});
        c.destroy();
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

        expect(rawArgs).toEqual(["4"]); // rawArgs shouldn't have side effects
        expect(argumentsInfo).toEqual([
            {
                key: "key",
                type: "number",
                description: "description",
            },
        ]);
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
        expect(rawArgs).toEqual(["teststring"]);
        expect(argumentsInfo).toEqual([
            {
                key: "key1",
                type: "string",
                description: "description",
            },
        ]);
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
        expect(rawArgs).toEqual(["y", "n"]);
        expect(argumentsInfo).toEqual([
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
        ]);
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

        // Mock the
        const mockGuild = {
            members: {
                fetch(): GuildMember {
                    return guildMember;
                },
            },
        };

        const expected = {
            full: "<@!123456789123456789>",
            key1: guildMember,
        };
        const result = await parseArgs(rawArgs, argumentsInfo, mockGuild);

        expect(result).toEqual(expected);
        expect(rawArgs).toEqual(["<@!123456789123456789>"]);
        expect(argumentsInfo).toEqual([
            {
                key: "key1",
                type: "user",
                description: "description",
            },
        ]);
    });

    it("parseArgs should error when getting the number", async () => {
        const rawArgs = ["Not a number"];
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
        const rawArgs: string[] = ["not a boolean"];
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

    it("parseArgs should get the user", async () => {
        const rawArgs = ["<@!invalidId>"];
        const argumentsInfo: Argument[] = [
            {
                key: "key1",
                type: "user",
                description: "description",
            },
        ];

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
            ArgumentRuntimeError
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
            ArgumentRuntimeError
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

    it("parseArgs should use the validator and return successfully", async () => {
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

    it("parseArgs should get all the arguments in a string[]", async () => {
        const rawArgs = ["teststring", "teststring 2"];
        const argumentsInfo: Argument[] = [
            {
                key: "key1",
                type: "strings",
                description: "description",
            },
        ];

        const expected = {
            full: "teststring teststring 2",
            key1: "teststring teststring 2",
        };
        const result = await parseArgs(rawArgs, argumentsInfo, guild);

        expect(result).toEqual(expected);
        expect(rawArgs).toEqual(["teststring", "teststring 2"]);
        expect(argumentsInfo).toEqual([
            {
                key: "key1",
                type: "strings",
                description: "description",
            },
        ]);
    });

    it("parseArgs should get all the remaining arguments in a string[]", async () => {
        const rawArgs = ["4", "teststring 2", "teststring 3"];
        const argumentsInfo: Argument[] = [
            {
                key: "key1",
                type: "number",
                description: "description",
            },
            {
                key: "key2",
                type: "strings",
                description: "description",
            },
        ];

        const expected = {
            full: "4 teststring 2 teststring 3",
            key1: 4,
            key2: "teststring 2 teststring 3",
        };
        const result = await parseArgs(rawArgs, argumentsInfo, guild);

        expect(result).toEqual(expected);
        expect(rawArgs).toEqual(["4", "teststring 2", "teststring 3"]);
        expect(argumentsInfo).toEqual([
            {
                key: "key1",
                type: "number",
                description: "description",
            },
            {
                key: "key2",
                type: "strings",
                description: "description",
            },
        ]);
    });

    it("parseArgs should error if string[] is not the last argument definition", async () => {
        const rawArgs = ["teststring", "teststring 2"];
        const argumentsInfo: Argument[] = [
            {
                key: "key1",
                type: "strings",
                description: "description",
            },
            {
                key: "key2",
                type: "string",
                description: "description",
            },
        ];

        return expect(parseArgs(rawArgs, argumentsInfo, guild)).rejects.toThrowError(
            "Argument Keys: [Argument of type strings can only be defined for the final argument.] are not valid. There are duplicates or keys contain reserved values 'full' or 'remaining'"
        );
    });
});
