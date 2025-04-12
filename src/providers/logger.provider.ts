import { inject, injectable } from "tsyringe";
import { ContextProvider } from "./context.provider";
import { styleText } from "node:util";

@injectable()
export class LoggerProvider {
  private loggerName = "";

  constructor(
    @inject(ContextProvider)
    private readonly executionContext: ContextProvider,
  ) {}

  private generatePrefixContextString() {
    return `[${new Date().toISOString()}] [${this.executionContext.correlationId}] | ${this.loggerName.padEnd(18) || "Unknown".padEnd(21)} |`;
  }

  setName(name: string) {
    this.loggerName = name;
  }

  log(...messages: string[]) {
    console.log(
      styleText(
        "green",
        [this.generatePrefixContextString(), ...messages].join(" "),
      ),
    );
  }

  error(...messages: string[]) {
    console.error(
      styleText(
        "red",
        [this.generatePrefixContextString(), ...messages].join(" "),
      ),
    );
  }

  warn(...messages: string[]) {
    console.warn(
      styleText(
        "yellow",
        [this.generatePrefixContextString(), ...messages].join(" "),
      ),
    );
  }

  debug(...messages: string[]) {
    console.debug(
      styleText(
        "blue",
        [this.generatePrefixContextString(), ...messages].join(" "),
      ),
    );
  }
}
