import "dotenv/config";

// Loads environment variables into the object to be used throughout the application
// instead of having process.env calls throughout the application
export const config = {
  appVersion: "0.1.0",
  token: process.env.DISCORD_TOKEN ?? "TOKEN_NOT_SET",
  clientId: process.env.DISCORD_CLIENT_ID ?? "CLIENT_ID_NOT_SET",
  guildId: process.env.DISCORD_GUILD_ID ?? "GUILD_ID_NOT_SET",

  // local development
  reloadCommands: false,
};
