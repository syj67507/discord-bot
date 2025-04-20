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

  private generatePrefixContextString(level: string) {
    const time = new Date().toISOString();
    const correlationId = this.executionContext.correlationId;
    const paddedName = this.loggerName.padEnd(19);
    return `[${time}] [${correlationId}] [${level.padEnd(5)}] | ${paddedName} |`;
  }

  setName(name: string) {
    this.loggerName = name;
  }

  log(...messages: string[]) {
    console.log(
      styleText(
        "green",
        [this.generatePrefixContextString("INFO"), ...messages].join(" "),
      ),
    );
  }

  error(...messages: string[]) {
    console.error(
      styleText(
        "red",
        [this.generatePrefixContextString("ERROR"), ...messages].join(" "),
      ),
    );
  }

  warn(...messages: string[]) {
    console.warn(
      styleText(
        "yellow",
        [this.generatePrefixContextString("WARN"), ...messages].join(" "),
      ),
    );
  }

  debug(...messages: string[]) {
    console.debug(
      styleText(
        "blue",
        [this.generatePrefixContextString("DEBUG"), ...messages].join(" "),
      ),
    );
  }
}
