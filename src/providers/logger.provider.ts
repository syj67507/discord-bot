import { inject, injectable } from "tsyringe";
import { ContextProvider } from "./context.provider";

@injectable()
export class LoggerProvider {
  private loggerName = "";

  constructor(
    @inject(ContextProvider)
    private readonly executionContext: ContextProvider,
  ) {}

  private generatePrefixContextString() {
    return `[${new Date().toISOString()}] [${this.executionContext.correlationId}] | ${this.loggerName.padEnd(18) || "Unknown".padEnd(20)} |`;
  }

  setName(name: string) {
    this.loggerName = name;
  }

  log(...messages: string[]) {
    console.log(this.generatePrefixContextString(), ...messages);
  }

  error(...messages: string[]) {
    console.error(this.generatePrefixContextString(), ...messages);
  }

  warn(...messages: string[]) {
    console.warn(this.generatePrefixContextString(), ...messages);
  }

  debug(...messages: string[]) {
    console.debug(this.generatePrefixContextString(), ...messages);
  }
}
