const discord = {
  token: process.env.DISCORD_TOKEN,
  debug: process.env.DISCORD_STACKTRACE ?? true,
};

export default discord;
