import { inject, injectable } from "tsyringe";
import { CONTEXT_PROVIDER_TOKEN, ContextProvider } from "./context.provider";

@injectable()
export class LoggerProvider {
  constructor(
    @inject(CONTEXT_PROVIDER_TOKEN)
    private readonly executionContext: ContextProvider,
  ) {}

  private generatePrefixContextString() {
    return `[${this.executionContext.correlationId}] [${new Date().toISOString()}]`;
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
