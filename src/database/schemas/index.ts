import { Pool } from 'pg';
import { schema as ctfSchema } from './ctf';
import { schema as teamServerSchema } from './teamserver';
import { schema as teamsSchema } from './teams';
import { schema as usersSchema } from './users';
import { schema as invitesSchema } from './invites';
import { schema as categoriesSchema } from './categories';
import { schema as challengesSchema } from './challenges';
import { schema as attemptsSchema } from './attempts';
import { schema as attachmentsSchema } from './attachments';

// add schemas to this as we go
const schemas = [
  ctfSchema,
  teamServerSchema,
  teamsSchema,
  usersSchema,
  invitesSchema,
  categoriesSchema,
  challengesSchema,
  attemptsSchema,
  attachmentsSchema];

// janky code that waits for each table to initialize before declaring the next one
export default async (pool: Pool) => {
  await schemas.reduce(async (promise, schema) => {
    await promise;
    await pool.query(schema);
  }, Promise.resolve());
};
