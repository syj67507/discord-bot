import fs from "fs";
import { logger as log } from "./logger";
require("dotenv").config();

/**
 * Registers GCP authentication/credentials using environment.
 * Requires
 *  GOOGLE_APPLICATION_CREDENTIALS_JSON to be set to the raw service account json details
 *  GOOGLE_APPLICATION_CREDENTIALS to be set "googleApplicationCredentials.json"
 */
export default function registerGCP() {
    const googleApplicationCredentialsJson: any =
        process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    fs.writeFileSync(
        "googleApplicationCredentials.json",
        googleApplicationCredentialsJson
    );
    log.info("GCP Credentials registered.");
}
