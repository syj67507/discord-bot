import { injectable } from "tsyringe";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class ContextProvider {
  correlationId: string;
  constructor() {
    this.correlationId = uuidv4();
  }
}
