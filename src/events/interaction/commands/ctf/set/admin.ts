import CommandInteraction from '../../../compat/CommandInteraction';
import {
  ApplicationCommandDefinition,
  ApplicationCommandOptionType,
  CommandOptionMap,
} from '../../../compat/types';
import { CTF } from '../../../../../database/models';

export default {
  name: 'admin',
  description: 'Set the admin role for the CTF',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'admin_role',
      description: 'The desired role',
      type: ApplicationCommandOptionType.ROLE,
      required: true,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const role = options.admin_role.toString();
    await ctf.setAdminRoleSnowflake(role);
    return `CTF admin role has been set to <@${role}>`;
  },
} as ApplicationCommandDefinition;
