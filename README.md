# ctfbot
Discord bot to facilitate an entire Capture the Flag competition internally. Official CTF platform of [San Diego CTF](https://sdc.tf).

## commands

The bot is controlled primarily through [Slash Commands](https://discord.com/developers/docs/interactions/slash-commands). 

There are two kinds of commands, administrative commands and user commands.

Discord also makes a distinction between globally registered commands and per-guild commands. All commands provided are per-guild commands, the bot will not respond to commands outside of a guild with which it is registered.

### administrative commands

To use the commands detailed in this section, your Discord user needs to have the admin role in the CTF settings. 

#### adding a new CTF
```java
/ctf add NAME [DESCRIPTION]
```

This creates a new CTF in the guild you're currently in. It will create all of the channel categories it will add competition channels to, as well as some meta channels for announcements and logging. Avoid deleting these categories and channels, but you can otherwise name them / rearrange them freely.

**Note**: there is a limit of one CTF per guild.

**Note 2**: until you *publish* the CTF by setting the start date and end date, challenges cannot be submitted.

**Note 3**: until you set an admin role (below), all commands (including administrative ones) can be executed by all roles.

#### editing a CTF
```java
/ctf set name NAME
/ctf set description DESCRIPTION
/ctf set admin ADMIN_ROLE
/ctf set start [START_DATE]
/ctf set end [END_DATE]
```

Edit various parameters of the current CTF.

Using `set start` without specifying a start date will cause the startdate to be set to "now". This effectively *publishes* a CTF. Likewise, using `set end` without specifying an end date will cause the current CTF to be closed immediately.

#### managing a CTF
```java
/ctf announce MESSAGE
```

Posts the message you provide in the official CTF #announcements channel. More formatting and details to come soon.

#### removing a CTF
```java
/ctf del
```

This causes the removal of the current guild's CTF *and all associated Teams, Categories, and Challenges*. There is no going back.

#### managing team servers
```java
/ctf server get [CTF_NAME]
/ctf server add NAME LIMIT CTF_NAME
/ctf server del NAME [CTF_NAME]
```

The first command will list all of the team servers belonging to the indicated CTF. The current CTF will be inferred if you are already on the main CTF guild or a team server.

The second command will add the current guild as a team server for the indicated CTF. Again, you must be an admin on the main CTF guild to run this command. 

The third command will remove the indicated team server from the indicated CTF. The CTF can also be inferred by the guild you are on. 

#### creating a team
```java
/team add NAME [SERVER_NAME]
```

Creating a team this way does not add anybody to the team, it is an *empty team*, initially. *This is the only command that technically creates invalid data.*

**Note**: this will add a team to the indicated team server, or the server will be inferred from the current guild. If you are not in a team server, or the team server is full, even if there are other available team servers, the command will fail.

**Note 2**: creating a team will always cause the creation of an associated *team role* and *team channel*.

#### editing a team
```java
/team set name NAME [TEAM_ROLE]
/team set description DESCRIPTION [TEAM_ROLE]
/team set color COLOR [TEAM_ROLE]
/team set server SERVER_NAME [TEAM_ROLE]
```

Edit the name, description, and role color of the associated team. If no team role is provided, the team to edit will be inferred, firstly from the current channel, and secondarily from the current user's team.

**Note**: when setting the team server of a team, the target team server must not be full. Also, the current team's channels will be deleted, message history will be lost, and current members will be given an invite to the new server where their new team channels await.

#### managing teams
```java
/team get
```

Returns a list of all teams currently in the CTF.

#### managing team users
```java
/team user get [TEAM_ROLE]
/team user add USER [TEAM_ROLE]
/team user del USER [TEAM_ROLE]
```

Allows you to list the users in a team, add a user to a team, and delete a user from a team respectively. If no team role is provided, the team to edit will be inferred firstly from the current channel, and secondarily from the current user's team.

**Note**: The usual restrictions apply; adding a user to a team will remove them from their previous team, removing a user from a team will add them to an individual team, and removing all the users from a team will cause that team to be deleted.

**Note 2**: Removing a user from a team will cause that team to lose the points that the user earned on behalf of the team. The user will keep credit for the flags they've submitted, and if you add them to a different team, their new team will gain points accordingly. 

#### removing teams
```java
/team del [TEAM_ROLE]
```

Deletes the team indicated, or infers the team to delete, firstly from the current channel, and secondarily from the current user's team. 

**Note**: This command kicks all the users off the team and adds each of them to individual teams.

**Note 2**: This will also cause the permanent deletion of the team role and the team channels.

#### creating new categories
```java
/category add NAME [DESCRIPTION]
```

Creates a new category with the provided name and description. This automatically creates a channel category with the same name in the main CTF guild.

#### editing categories
```java
/category set name NEW_NAME NAME
/category set description DESCRIPTION NAME
```

Edit the name and description of a category you identify by name.

#### managing categories
```java
/category get [NAME]
```
Without arguments, returns a list of all categories currently in the CTF.
Will also return a list of all the challenges in an indicated category.

#### removing categories
```java
/category del NAME
```
Removes the provided category from the current CTF. *This will also delete all challenges associated with this category*.

#### creating new challenges
```java
/challenge add NAME CATEGORY
```

Creates a new CTF challenge. This also creates a challenge text channel in its category. Lots of important defaults are set when a challenge is first created:

* **Author** defaults to the Discord Username of the user executing the command.
* **Prompt** defaults to an empty string.
* **Difficulty** defaults to *Baby*.
* **Initial Points** defaults to 100 points.
* **Minimum Points** defaults to 100 points. This means this challenge is statically scored by default.
* **Point Decay** defaults to 100. This means, if Initial Points and Minimum Points are different, it will take 100 solves for the points this challenge awards to fall to the value of Minimum Points.
* **Flag** defaults to a randomly generated string resembling `flag{9a39mHrasu8MVZ32x4Kg}`.

All of these settings can be changed in further commands.

#### editing challenges
```java
/challenge set name NAME [CHALLENGE_NAME]
/challenge set author AUTHOR [CHALLENGE_NAME]
/challenge set prompt PROMPT [CHALLENGE_NAME]
/challenge set difficulty DIFFICULTY [CHALLENGE_NAME]
/challenge set points POINTS [CHALLENGE_NAME]
/challenge set initialpoints POINTS [CHALLENGE_NAME]
/challenge set minimumpoints POINTS [CHALLENGE_NAME]
/challenge set pointdecay DECAY [CHALLENGE_NAME]
/challenge set flag FLAG [CHALLENGE_NAME]
/challenge set publish [PUBLISH_TIME] [CHALLENGE_NAME]
```

Edits the challenge variables in a predictable way. Each command allows specifying the challenge to modify, but will otherwise attempt to infer this information if you are in a challenge channel.

**Note**: `set points 500` is an alias for `set initialpoints 500` and `set minimumpoints 500`. This allows setting static points with a single command.

**Note 2**: Using `set publish` without specifying a publish time will set it to "now", publishing the challenge instantly.


#### managing challenges
```java
/challenge get [NAME]
```

Without arguments, returns a list of all challenges in the CTF.
While indicating a particular challenge, returns all available information about that challenge.

#### removing challenges
```java
/challenge del [CHALLENGE_NAME]
```

Removes the challenge indicated, or infers it from the current challenge channel if its missing. *This causes all recorded attempts to solve this challenge to be deleted forever*.

#### managing attachments
```java
/challenge attach get [CHALLENGE_NAME]
/challenge attach add NAME URL [CHALLENGE_NAME]
/challenge attach del NAME [CHALLENGE_NAME]
```

The first command will list all file attachments of a particular challenge. The current challenge can also be inferred if you are in a challenge channel.

The second command will add a file attachment to an existing challenge. 

The third command will delete a file attachment from a challenge.

### user commands

All users in a the server are able to use these commands regardless of admin status

#### joining a team
```java
/team invite [DISCORD_USERNAME]
/team join [TEAM_NAME]
```

Invite allows for the owner of a team to invite a user within the CTF to their current 
team. Only succeeds if the username is valid, if the user has accepted ToS, and is on a team by themselves.

Join works similarly to this, attempting to join a team but only succeeding if the 
team name is valid, if the user attempting to join a team hasn't already joined another
team, and as long as the user attempting to join has been invited to the team they
are trying to join. If the user has yet to be invited, the bot will DM the team owner
a message in which they can react to accept this invite. The message will only be sent once regardless of the times invited, and thus an ignore/ "no reaction" is equivalent to a reject.

**Note 1:** check for individuals being on a team of one through the databse, not the server

**Note 2:** if these are used outside of the main server, the user is given instructions on 
how to do it properly in the main server


#### team management
```java
/team set name [NAME]
/team set description [DESCRIPTION]
/team set color [COLOR]
```

Similar to the admin only commands, these take in no argument for team and will only affect
the user's current team. Non-admins will only be allowed to use this command in their specific
team channel, but the functionality will carry over.

#### scoreboard
```java
/scoreboard top [CATEGORY]
/scoreboard team [TEAM_NAME]
/scoreboard standing [TEAM_NAME]
```

First command prints a scoreboard detailing the top 20 teams and their total points in the specified
category. If no category is specified, it will instead list the top 20 teams overall in the CTF.

Second command gives info about a specific team, detailing their info (name, description, members,
etc.) and thier standing along with total points and attempt correct percentage. If no team is specified,
it bases it on the user's current team.

Third command gives the a view similar to top for the specified team, listing the 9 teams above and below
the specified team overall and their names, points, and place values. If no team is specified, the user's
team will be inferred.

#### challenges
```java
/challenge submit [CHALLENGE_NAME] [FLAG]
```

Allows a user to submit a flag for a specified challenge, only counting the attempt as valid if the 
challenge name is valid. If the name is a valid challenge, then the bot checks to assure the flag is
correct, adjusting the user's attempts total accordingly with correct and incorrect attempts. If correct,
first blood checks are done along with adjusting of points for that challenge.