import { CTF } from '../../../../database/models';

export default {
  name: 'standing',
  description: "Show your current team's standing relative to others teams",
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);
  },
} as ApplicationCommandDefinition;
