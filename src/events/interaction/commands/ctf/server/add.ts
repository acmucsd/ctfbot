import CommandInteraction from '../../../compat/CommandInteraction';
import { ApplicationCommandDefinition, ApplicationCommandOptionType, CommandOptionMap } from '../../../compat/types';
import { CTF } from '../../../../../database/models';

export default {
  name: 'add',
  description: 'Adds the current guild as a team server for the indicated CTF',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'limit',
      description: 'The max number of teams allowed to be in the server',
      type: ApplicationCommandOptionType.INTEGER,
      required: true,
    },
    {
      name: 'ctf_name',
      description: 'The name of the CTF to add the guild to',
      type: ApplicationCommandOptionType.STRING,
      required: false,
    },
    {
      name: 'name',
      description: 'The unique identifier the server will be referred to as',
      type: ApplicationCommandOptionType.STRING,
      required: false,
    },

  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const name = (options.name) ? options.name as string : interaction.guild.name;
    const ctf = await ((options.ctf_name) ? CTF.fromNameCTF(options.ctf_name as string) : CTF.fromGuildSnowflakeCTF(interaction.guild.id));
    void ctf.createTeamServer(interaction.guild, name, options.limit as number);
  },
} as ApplicationCommandDefinition;
