import example from './example_interaction';
import { Interaction } from './interaction_type';
import {
  category, challenge, ctf, scoreboard, team,
} from './commands';

const interactionEvent = (interaction: Interaction = example) => {
  if (interaction.type === 2) {
    // eslint-ignore-next-line
    switch (interaction.data.name) {
      case ('category'):
        // category(interaction);
        break;
      case ('challenge'):
        // challenge(interaction);
        break;
      case ('ctf'):
        // ctf(interaction);
        break;
      case ('scoreboard'):
        // scoreboard(interaction);
        break;
      case ('team'):
        // team(interaction);
        break;
      default:
        console.log();
        break;
    }
  }
};

export default interactionEvent;
