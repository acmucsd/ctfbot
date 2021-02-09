export const ApplicationCommandOptionType: { [key: string]: number } = {
  SUB_COMMAND: 1,
  SUB_COMMAND_GROUP: 2,
  STRING: 3,
  INTEGER: 4,
  BOOLEAN: 5,
  USER: 6,
  CHANNEL: 7,
  ROLE: 8,
};

export const InteractionType: { [key: string]: number } = {
  PING: 1,
  APPLICATION_COMMAND: 2,
};

export const InteractionResponseType: { [key: string]: number } = {
  PONG: 1,
  ACKNOWLEDGE: 2,
  CHANNEL_MESSAGE: 3,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  ACKNOWLEDGE_WITH_SOURCE: 5,
};
