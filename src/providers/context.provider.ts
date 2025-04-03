import { injectable } from "tsyringe";
import { v4 as uuidv4 } from "uuid";

export const CONTEXT_PROVIDER_TOKEN = "CONTEXT_PROVIDER_TOKEN";

@injectable()
export class ContextProvider {
  correlationId: string;
  constructor() {
    this.correlationId = uuidv4();
  }
}
