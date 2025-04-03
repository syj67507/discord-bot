import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "./base-command";
import { inject, injectable } from "tsyringe";
import { ExecutionContext } from "./ExecutionContext";

// Enums are used to define all the options so that we
// can have fewer magic strings when it comes to grabbing the options
// in the run method of the command
//
// I made this decision because trying to pass in an args object to the run function
// provides us the option to automatically type everything, means that there is overengineering
// to parse the options and create this object just to have the typing
// I believe that extra effort is error prone and not worth it
// even this might be unnecessary since it doesn't provide us anything besides avoiding typos

@injectable()
export class PingCommand extends BaseCommand {
  constructor(
    @inject("EXECUTION_CONTEXT")
    private readonly executionContext: ExecutionContext,
  ) {
    super();
  }

  static registrationData = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("ping command")
    .addStringOption((option) =>
      option.setName("reply").setDescription("reply option"),
    )
    .addStringOption((option) =>
      option.setName("another").setDescription("another option"),
    );

  execute(interaction: ChatInputCommandInteraction): void {
    console.log(this.executionContext.correlationId);
    interaction.reply(`Pong! w/ ${interaction.options.getString("reply")}`);
  }
}
