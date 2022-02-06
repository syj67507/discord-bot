import path from "path";
import { readFileSync } from "fs";

const greninjaData = JSON.parse(
    readFileSync(path.join(__dirname, "greninja.json")).toString()
);

global["pokemonData"] = greninjaData;
