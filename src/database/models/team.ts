import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { Challenge, CTF, Invite, TeamServer, User } from '.';
import { AttemptRow, InviteRow, TeamRow, UserRow } from '../schemas';
import query from '../database';
import { logger } from '../../log';
import { NoRoomError } from '../../errors';

export default class Team {
  row: TeamRow;

  constructor(row: TeamRow) {
    this.row = row;
  }

  static teamCompare(a: minimalTeam, b: minimalTeam) {
    const pointDiff = a.points - b.points;
    if (pointDiff !== 0) {
      return pointDiff;
    }

    const accDiff = a.accuracy - b.accuracy;
    if (accDiff !== 0) {
      return accDiff;
    }

    return a.name.localeCompare(b.name);
  }

  /** Team Creation / Deletion */
  // makeTeam made in TeamServer

  async deleteTeam(client: Client) {
    const teamServer = await CTF.fromIdTeamServer(this.row.team_server_id);
    const ctf = await CTF.fromIdCTF(teamServer.row.ctf_id);
    await teamServer.getGuild(client).channels.resolve(this.row.text_channel_snowflake)?.delete();
    /** TODO: Remove every team member's team roles */
    await teamServer.deleteRole(client, this.row.team_role_snowflake_team_server).catch(() => {
      /* Do nothing, because it means the team server already deleted*/
    });
    await ctf.deleteRole(client, this.row.team_role_snowflake_team_server).catch(() => {
      /* Do nothing, because it means the team server already deleted*/
    });
    if (teamServer.row.guild_snowflake !== ctf.row.guild_snowflake) {
      await ctf.deleteRole(client, this.row.team_role_snowflake_main).catch(() => {
        /* Do nothing, because it means the team server part of the main server already deleted*/
      });
    }
    await query(`DELETE FROM teams WHERE id = ${this.row.id}`);
    logger(`Deleted team **${this.row.name}** from ctf **${ctf.row.name}**`);
    /** TODO: Make and assign each member a new team */
  }

  /** Team Setters */
  // Valid Role in the TeamServer, unique among other Teams <- taken care of because it's made, not specified
  async setTeamRoleSnowflakeTeamServer(team_role_snowflake_team_server: string) {
    await query(
      `UPDATE teams SET team_role_snowflake_team_server = ${team_role_snowflake_team_server} WHERE id = ${this.row.id}`,
    );
    this.row.team_role_snowflake_team_server = team_role_snowflake_team_server;
  }

  async setTeamRoleSnowflakeMain(team_role_snowflake_main: string) {
    await query(`UPDATE teams SET team_role_snowflake_main = ${team_role_snowflake_main} WHERE id = ${this.row.id}`);
    this.row.team_role_snowflake_main = team_role_snowflake_main;
  }

  // Valid Channel in the TeamServer, unique among other Teams <- taken care of because it's made, not specified
  async setTextChannelSnowflake(text_channel_snowflake: string) {
    await query(`UPDATE teams SET text_channel_snowflake = ${text_channel_snowflake} WHERE id = ${this.row.id}`);
    this.row.text_channel_snowflake = text_channel_snowflake;
  }

  async setTeamCaptain() {}

  async setTeamServerID(client: Client, team_server_id: number) {
    const newTeamServer = await CTF.fromIdTeamServer(team_server_id);
    if (!(await newTeamServer.hasSpace())) throw new NoRoomError();

    if (this.row.team_server_id) {
      /** If there is a previous team server */ // Delete old text channel and team server role
      const oldTeamServer = await CTF.fromIdTeamServer(this.row.team_server_id);
      oldTeamServer.deleteChannel(client, [this.row.text_channel_snowflake]);
      await oldTeamServer.deleteRole(client, this.row.team_role_snowflake_team_server);
    }

    await query(`UPDATE teams SET team_server_id = $1 WHERE id = ${this.row.id}`, [team_server_id]);
    this.row.team_server_id = team_server_id;

    // Make their team role
    const role = await newTeamServer.makeRole(client, `Team ${this.row.name}`);
    await this.setTeamRoleSnowflakeTeamServer(role.id);

    // Make and configure the channel on the new team server
    await newTeamServer.makeChannel(client, this.row.name.toLowerCase().replace(' ', '-')).then(async (textChannel) => {
      // Description creation is kept split up for readability
      let description = `You have joined **${newTeamServer.ctf.row.name}**, and you are currently in your team channel.`;
      description +=
        '\n\nTo set your **team name** or **team color**, you can use the `/setname` and `/setcolor` commands respectively.';
      description +=
        "\n\nTo **invite** another person onto your team, you'll need to use `/invite @username`. You should do this in the Main Guild. Then, they will need to accept your invite. Similarly, to **join** another team, they will have to invite you first.";
      description += '\n\nLastly, to **submit flags**, you will need to use `/submit #challenge flag`.';
      description += `\n\nPlease look for any users with the <@&${newTeamServer.row.admin_role_snowflake}> role if you have any questions, and happy hacking!`;

      // Move team channel to team category
      await textChannel.setParent(newTeamServer.row.team_category_snowflake);

      // Make sure only the team can view their own team channel
      await textChannel.overwritePermissions([
        {
          id: textChannel.guild.roles.everyone,
          deny: ['VIEW_CHANNEL'],
        },
        {
          id: textChannel.guild.roles.resolve(this.row.team_role_snowflake_team_server),
          allow: ['VIEW_CHANNEL'],
        },
      ]);

      // Send welcome message
      await textChannel.send(
        new MessageEmbed()
          .setTitle(`Welcome to your personal space, ${this.row.name}`)
          .setAuthor(`${newTeamServer.row.name} - Team ${this.row.name}`)
          .setDescription(description)
          .setTimestamp()
          .setColor('50c0bf'),
      );

      // Update the database with this channel
      await this.setTextChannelSnowflake(textChannel.id);
    });
  }

  // Unique per CTF
  async setName(client: Client, newName: string) {
    const teamServer = await CTF.fromIdTeamServer(this.row.team_server_id);
    const ctf = await CTF.fromIdCTF(teamServer.row.ctf_id);

    const teams = (await ctf.getAllTeams()).filter((team) => team.row.name === newName);
    if (teams.length !== 0) throw new Error('a team with that name already exists');

    await query(`UPDATE teams SET name = $1 WHERE id = ${this.row.id}`, [newName]);
    this.row.name = newName;

    await ctf.setRoleName(client, this.row.team_role_snowflake_main, `Team ${newName}`);
    if (this.row.team_role_snowflake_main !== this.row.team_role_snowflake_team_server) {
      await teamServer.setRoleName(client, this.row.team_role_snowflake_team_server, newName);
    }
    await teamServer.renameChannel(client, this.row.text_channel_snowflake, newName);
    return newName;
  }

  async setDescription(description: string) {
    await query(`UPDATE teams SET description = $1 WHERE id = ${this.row.id}`, [description]);
    this.row.description = description;
    return `Changed **${this.row.name}**'s description to **${description}**`;
  }

  async setColor(client: Client, color: string) {
    if (!/^([0-9a-f]{6})$/i.test(color)) {
      throw new Error('invalid color');
    }
    const oldColor = this.row.color?.toLowerCase();
    await query(`UPDATE teams SET color = $1 WHERE id = ${this.row.id}`, [color.toLowerCase()]);
    this.row.color = color;
    const teamServer = await CTF.fromIdTeamServer(this.row.team_server_id);
    const ctf = await CTF.fromIdCTF(teamServer.row.ctf_id);
    await teamServer.setRoleColor(client, this.row.team_role_snowflake_team_server, color);
    if (teamServer.row.guild_snowflake !== ctf.row.guild_snowflake) {
      await ctf.setRoleColor(client, this.row.team_role_snowflake_main, color);
    }
    return `Changed **${this.row.name}**'s color ${oldColor != null ? `from **${oldColor}** ` : ''}to **${color}**`;
  }

  async setCaptain(captain_user_id: number) {
    await query(`UPDATE teams SET captain_user_id = $1 WHERE id = ${this.row.id}`, [captain_user_id]);
    this.row.captain_user_id = captain_user_id;
  }

  /** Invite Retrieval */
  async fromUserIDInvite(user_id: number) {
    const { rows } = await query(`SELECT * FROM invites WHERE team_id = ${this.row.id} and user_id = $1`, [user_id]);
    if (rows.length === 0) throw new Error('no invite for that user');
    return new Invite(rows[0] as InviteRow);
  }

  // remove user from team
  async removeUser(client: Client, user: User) {
    // if team is empty, it is deleted
    // WARNING: WILL CAUSE AN ILLEGAL STATE
    if (await user.isAlone()) return this.deleteTeam(client);

    // otherwise, we'll need to be more precise about their removal
    // TODO
  }

  // add user to team
  async addUser(client: Client, user: User) {
    // can only add users that are alone!
    const isUserAlone = await user.isAlone();
    if (!isUserAlone) throw new Error('User has already joined a team');

    const oldTeam = await user.getTeam();
    const oldTeamServer = await CTF.fromIdTeamServer(oldTeam.row.team_server_id);
    const oldTeamServerGuild = oldTeamServer.getGuild(client);
    await oldTeam.deleteTeam(client);

    await user.setTeamID(this.row.id);

    // role granting
    const guildMember = oldTeamServerGuild.member(user.row.user_snowflake);

    // main guild
    const mainGuildMember = oldTeamServer.ctf.getGuild(client).member(user.row.user_snowflake);
    await mainGuildMember.roles.add(this.row.team_role_snowflake_main);

    // IF the user is already on the right TeamServer, grant new roles
    const newTeamServer = await CTF.fromIdTeamServer(this.row.team_server_id);
    if (oldTeamServer.row.id === newTeamServer.row.id)
      await guildMember.roles.add(this.row.team_role_snowflake_team_server);
    // otherwise, just defer to when they join the new teamserver
    // btw we should kick them if this isn't the main guild
    else if (newTeamServer.ctf.row.guild_snowflake !== oldTeamServer.row.guild_snowflake) {
      await guildMember.kick('You need to join your new team server');
      // we'll also need to make sure we get the right TS role in the main guild
      await mainGuildMember.roles.remove(oldTeamServer.row.invite_role_snowflake);
      await mainGuildMember.roles.add(newTeamServer.row.invite_role_snowflake);
    }

    logger(
      `**${client.users.resolve(user.row.user_snowflake).username}** has joined team **${this.row.name} (${
        this.row.id
      })**`,
    );
  }

  /** User Retrieval */
  async getAllUsers() {
    const { rows } = await query(`SELECT * FROM users WHERE team_id = ${this.row.id}`);
    return rows.map((row) => new User(row as UserRow));
  }

  async calculateAccuracy(category?: string) {
    // TODO: modify by query to account for categories if specified
    const { rows } = await query(
      `SELECT attempts.successful, COUNT(attempts.successful)::integer FROM attempts, users WHERE attempts.user_id = users.id AND users.team_id = ${this.row.id} GROUP BY attempts.successful`,
    );

    type AccuracyRow = {
      successful: boolean;
      count: number;
    };

    const successfulAttempts = (rows as AccuracyRow[]).find((row) => row.successful)?.count ?? 0;
    const unsuccessfulAttempts = (rows as AccuracyRow[]).find((row) => !row.successful)?.count ?? 0;
    const total = successfulAttempts + unsuccessfulAttempts || 1;

    return successfulAttempts / total;
  }

  async calculatePoints(category?: string) {
    // first, which challenges have been solved by this team?
    // second, how many points is each challenge worth?
    // third, what is the sum?
    const { rows } = await query(
      `SELECT initial_points, min_points, point_decay, solves::integer FROM (SELECT challenges.id as challenge_id, team_id, COUNT(team_id) OVER (PARTITION BY challenge_id) AS solves FROM challenges, attempts, users WHERE challenges.id = attempts.challenge_id AND attempts.user_id = users.id AND attempts.successful = true) AS solved, challenges WHERE challenge_id = challenges.id AND team_id = ${this.row.id}`,
    );

    type PointsRow = {
      initial_points: number;
      min_points: number;
      point_decay: number;
      solves: number;
    };

    return (rows as PointsRow[]).reduce(
      (accum, curr) =>
        accum + Challenge.calculateDynamicPoints(curr.initial_points, curr.min_points, curr.point_decay, curr.solves),
      0,
    );
  }

  // will return true if anybody on the team has solved the provided challenge, false otherwise
  async hasSolvedChallenge(challenge: Challenge): Promise<boolean> {
    const { rows } = await query(
      `SELECT count(attempts.id) FROM attempts, users, teams WHERE attempts.user_id = users.id AND users.team_id = teams.id AND teams.id = ${this.row.id} AND challenge_id = ${challenge.row.id} AND attempts.successful = true`,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return rows[0] && rows[0].count && parseInt(rows[0].count) > 0;
  }

  async getMinimalTeam(category?: string): Promise<minimalTeam> {
    const team = {
      name: this.row.name,
      points: await this.calculatePoints(category),
      accuracy: await this.calculateAccuracy(category),
      id: this.row.id,
    };
    return team;
  }

  async getTeamChannel(client: Client) {
    const guild = await TeamServer.getGuildFromTeamServerID(client, this.row.team_server_id);
    return guild.channels.resolve(this.row.text_channel_snowflake) as TextChannel;
  }

  static async fromID(id: number): Promise<Team> {
    const { rows } = await query(`SELECT * FROM teams WHERE id = ${id}`);
    if (rows.length === 0) throw new Error('no team found (ILLEGAL STATE)');
    return new Team(rows[0] as TeamRow);
  }
}

export interface minimalTeam {
  name: string;
  points: number;
  accuracy: number;
  id: number;
}
