import "dotenv/config";
import packageJson from "../package.json";

// Loads environment variables into the object to be used throughout the application
// instead of having process.env calls throughout the application
export const config = {
  appVersion: packageJson.version,
  token: process.env.DISCORD_TOKEN ?? "TOKEN_NOT_SET",
  clientId: process.env.DISCORD_CLIENT_ID ?? "CLIENT_ID_NOT_SET",
  guildId: process.env.DISCORD_GUILD_ID ?? "GUILD_ID_NOT_SET",
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  lavalinkPassword: process.env.LAVALINK_PASSWORD ?? "",

  // local development
  reloadCommands: true,
  structuredLogs: true,
  colorizeStructuredLogs: false, // must have structured logs on, useful for local development, not intended for deployed environments
};
