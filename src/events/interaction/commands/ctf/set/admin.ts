import { CTF } from '../../../../../database/models';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';

export default {
  name: 'admin',
  description: 'Set the admin role for the CTF',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'admin_role',
      description: 'The desired role',
      type: ApplicationCommandOptionTypes.ROLE,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const role = interaction.options.getRole('admin_role', true);
    await ctf.setAdminRoleSnowflake(role.id);
    return `CTF admin role has been set to <@${role.id}>`;
  },
} as ExecutableSubCommandData;
