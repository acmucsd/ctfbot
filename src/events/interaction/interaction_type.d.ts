export type Interaction = {
  type: number;
  token: string;
  member: FauxGuildMember;
  id: string;
  guild_id: string;
  data: ApplicationCommandInteractionData;
  channel_id: string;
};

export type ApplicationCommandInteractionData = {
  id: string;
  name: string;
  options?: ApplicationCommandInteractionDataOption[];
};

export type ApplicationCommandInteractionDataOption = {
  name: string;
  value?: string;
  options?: ApplicationCommandInteractionDataOption[];
};

export type FauxGuildMember = {
  user: FauxUser;
  roles: string[];
  premium_since: string;
  permissions: string;
  pending: boolean;
  nick: string;
  mute: boolean;
  joined_at: string;
  is_pending: boolean;
  deaf: boolean;
};

export type FauxUser = {
  id: number;
  username: string;
  avatar: string;
  discriminator: string;
  public_flags: number;
};
