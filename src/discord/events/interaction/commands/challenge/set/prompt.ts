import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { getChallengeByInteraction } from '../../../../../util/ResourceManager';

export default {
  name: 'prompt',
  description: "Changes the indicated challenge's prompt",
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'prompt',
      description: 'The desired challenge prompt',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
    {
      name: 'challenge_channel',
      description: "The challenge's current name",
      type: ApplicationCommandOptionTypes.CHANNEL,
      required: false,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const challenge = await getChallengeByInteraction(interaction);
    const newPrompt = interaction.options.getString('prompt', true);

    challenge.prompt = newPrompt;
    await challenge.save();

    return `Challenge prompt has been set to **${newPrompt}**.`;
  },
} as ExecutableSubCommandData;
