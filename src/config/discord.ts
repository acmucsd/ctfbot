const discord = {
  token: process.env.DISCORD_TOKEN,
  debug: process.env.NODE_ENV !== 'production',
};

export default discord;
