export const schema = `CREATE TABLE IF NOT EXISTS challenge_dependencies (
  id serial,
  main_challenge_id integer REFERENCES challenges ON DELETE CASCADE,
  challenge_dependency_id integer REFERENCES challenges ON DELETE CASCADE,
  PRIMARY KEY( id )
);`;

export interface ChallengeDependencyRow {
  id: number;
  main_challenge_id: number;
  challenge_dependency_id: number;
}
