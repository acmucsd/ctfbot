import { CTF } from '../../../../database/models';

export default {
  name: 'team',
  description: 'Show player standing among your team',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);
  },
} as ApplicationCommandDefinition;
