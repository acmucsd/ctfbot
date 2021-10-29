import standing from './standing';
import team from './team';
import top from './top';
import { ChatInputCommandDefinition } from '../../interaction';

export default {
  name: 'scoreboard',
  description: 'Generate a scoreboard for the current CTF',
  options: [standing, top, team],
  default_permission: false,
} as ChatInputCommandDefinition;
