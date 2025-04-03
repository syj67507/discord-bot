import "reflect-metadata";
import { container } from "tsyringe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PingCommand } from "./ping.command";
import { ChatInputCommandInteraction } from "discord.js";
import {
  CONTEXT_PROVIDER_TOKEN,
  ContextProvider,
} from "../providers/context.provider";
import { LoggerProvider } from "../providers/logger.provider";

describe("Shams", () => {
  const interaction = {
    options: {
      getString: vi.fn(),
    },
    reply: vi.fn(),
  } as unknown as ChatInputCommandInteraction;

  beforeEach(() => {
    vi.restoreAllMocks();

    // tsyringe is stupid and doesn't let auto inject stuff, idk how to fix
    container.register(CONTEXT_PROVIDER_TOKEN, {
      useValue: new ContextProvider(),
    });
    const contextProvider = container.resolve(ContextProvider);
    container.register(LoggerProvider, {
      useValue: new LoggerProvider(contextProvider),
    });
    const loggerProvider = container.resolve(LoggerProvider);
    container.register(PingCommand, {
      useValue: new PingCommand(loggerProvider),
    });
  });

  it("should reply to the command successfully", async () => {
    const pingCommand = container.resolve(PingCommand);

    await pingCommand.execute(interaction);

    expect(interaction.reply).toHaveBeenCalledTimes(1);
  });
});
