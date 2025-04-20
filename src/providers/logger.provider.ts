import { inject, injectable } from "tsyringe";
import { ContextProvider } from "./context.provider";
import { styleText } from "node:util";
import { config } from "../config";

@injectable()
export class LoggerProvider {
  private loggerName = "";

  constructor(
    @inject(ContextProvider)
    private readonly executionContext: ContextProvider,
  ) {}

  setName(name: string) {
    this.loggerName = name;
  }

  private regularLog(level: string, ...messages: string[]) {
    const time = new Date().toISOString();
    const correlationId = this.executionContext.correlationId;
    const paddedName = this.loggerName.padEnd(19);
    return `[${time}] [${correlationId}] [${level.padEnd(5)}] | ${paddedName} | ${messages.join(" ")}`;
  }

  private structuredLog(level: string, message: string, color: string) {
    const output = JSON.stringify({
      level: "INFO",
      correlationId: this.executionContext.correlationId,
      time: new Date().toISOString(),
      logger: this.loggerName,
      message: message,
      appVersion: config.appVersion,
    });
    if (config.colorizeStructuredLogs) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log(styleText(color as any, output));
    } else {
      console.log(output);
    }
  }

  log(...messages: string[]) {
    if (config.structuredLogs) {
      this.structuredLog("INFO", messages.join(" "), "green");
      return;
    }

    console.log(styleText("green", this.regularLog("INFO", ...messages)));
  }

  error(...messages: string[]) {
    if (config.structuredLogs) {
      this.structuredLog("ERROR", messages.join(" "), "red");
      return;
    }

    console.log(styleText("red", this.regularLog("ERROR", ...messages)));
  }

  warn(...messages: string[]) {
    if (config.structuredLogs) {
      this.structuredLog("WARN", messages.join(" "), "yellow");
      return;
    }

    console.log(styleText("yellow", this.regularLog("WARN", ...messages)));
  }

  debug(...messages: string[]) {
    if (config.structuredLogs) {
      this.structuredLog("DEBUG", messages.join(" "), "blue");
      return;
    }

    console.log(styleText("blue", this.regularLog("DEBUG", ...messages)));
  }
}
