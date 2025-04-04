import "reflect-metadata";
import { container } from "tsyringe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PingCommand } from "./ping.command";
import { ChatInputCommandInteraction } from "discord.js";
import { ContextProvider } from "../providers/context.provider";
import { LoggerProvider } from "../providers/logger.provider";

describe("Ping Command", () => {
  const interaction = {
    options: {
      getString: vi.fn(),
    },
    reply: vi.fn(),
  } as unknown as ChatInputCommandInteraction;

  beforeEach(() => {
    vi.restoreAllMocks();

    // tsyringe has issues with vitest and so it requires explicit registration of dependencies
    container.register(ContextProvider, { useClass: ContextProvider });
    container.register(LoggerProvider, { useClass: LoggerProvider });
    container.register(PingCommand, { useClass: PingCommand });
  });

  it("should reply to the command successfully", async () => {
    const pingCommand = container.resolve(PingCommand);

    await pingCommand.execute(interaction);

    expect(interaction.reply).toHaveBeenCalledTimes(1);
    expect(interaction.reply).toHaveBeenCalledWith("Pong!");
  });

  it("should reply to the command successfully with the reply option", async () => {
    const pingCommand = container.resolve(PingCommand);
    vi.spyOn(interaction.options, "getString").mockImplementation(
      () => "test option",
    );

    await pingCommand.execute(interaction);

    expect(interaction.reply).toHaveBeenCalledTimes(1);
    expect(interaction.reply).toHaveBeenCalledWith("Pong! test option");
  });
});
