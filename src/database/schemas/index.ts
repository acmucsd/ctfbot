import { Pool } from 'pg';
import { schema as ctfSchema } from './ctf';
import { schema as teamServerSchema } from './teamserver';
import { schema as teamsSchema } from './team';
import { schema as usersSchema } from './user';
import { schema as invitesSchema } from './invite';
import { schema as categoriesSchema } from './category';
import { schema as categoryChannelsSchema } from './category_channel';
import { schema as challengesSchema } from './challenge';
import { schema as challengeChannelsSchema } from './challenge_channel';
import { schema as attemptsSchema } from './attempt';
import { schema as attachmentsSchema } from './attachment';

// add schemas to this as we go
const schemas = [
  ctfSchema,
  teamServerSchema,
  teamsSchema,
  usersSchema,
  invitesSchema,
  categoriesSchema,
  categoryChannelsSchema,
  challengesSchema,
  challengeChannelsSchema,
  attemptsSchema,
  attachmentsSchema,
];

// janky code that waits for each table to initialize before declaring the next one
export default async (pool: Pool) => {
  await schemas.reduce(async (promise, schema) => {
    await promise;
    await pool.query(schema);
  }, Promise.resolve());
};

export { AttachmentRow } from './attachment';
export { AttemptRow } from './attempt';
export { CategoryRow } from './category';
export { CategoryChannelRow } from './category_channel';
export { ChallengeRow } from './challenge';
export { ChallengeChannelRow } from './challenge_channel';
export { CTFRow } from './ctf';
export { InviteRow } from './invite';
export { TeamRow } from './team';
export { TeamServerRow } from './teamserver';
export { UserRow } from './user';
