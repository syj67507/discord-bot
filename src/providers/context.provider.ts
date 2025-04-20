import { scoped, Lifecycle } from "tsyringe";
import { v4 as uuidv4 } from "uuid";

@scoped(Lifecycle.ContainerScoped)
export class ContextProvider {
  correlationId: string;
  constructor() {
    this.correlationId = uuidv4().replace(/-/g, "").slice(0, 16);
  }
}
