# ctfbot
Discord bot to facilitate an entire Capture the Flag competition internally. Official CTF platform of [San Diego CTF](https://sdc.tf).

## disclaimer

**This code is a work in progress, is in heavy beta**, ***and not necessarily even recommended for production use yet.***
The team behind this bot created it as an experiment and used it for the first time to host [San Diego CTF 2021](https://github.com/acmucsd/sdctf-2021).
In places, the code might be monkeypatch'd for that competition, or might otherwise not match the WIP documentation.

Look for (TODO) next to documented features that have not been added yet.

Also, we're a bunch of college students, and while we expect to work on it heavily each year to improve it,
**we are not on call to solve problems most of the time.**

**Bottom line**: if you want to use this while its in beta, don't expect everything to work, expect Discord rate limiting to cause weird problems, and don't expect support from ACM Cyber.

Also, you should check out our [FAQ](FAQ.md) if you have a question about the project.

## contributing to this project

Anyone and everyone is welcome to contribute. Please take a moment to
review the [guidelines for contributing](CONTRIBUTING.md).

* [Bug reports](CONTRIBUTING.md#bug-reports)
* [Feature requests](CONTRIBUTING.md#feature-requests)
* [Pull requests](CONTRIBUTING.md#pull-requests)

## getting started

You'll need a [Discord bot](https://discord.com/developers/applications) on a server with the `bot` and `application.commands` scopes.
On servers, we usually just grant `Administrator` permissions.
You'll need to keep the bot `private` (so others can't add it to their server and kick off a CTF).
Finally, you'll probably need `Server Members Intent` so the bot can download info about the online users.

Once you have a bot, you can add its token to a `.env` file in the root of the project.
```dotenv
DISCORD_TOKEN=yourtoken
PGPASSWORD=somethingrandom
```

The recommended way to run the project is with docker / [docker-compose](https://docs.docker.com/compose/). Make sure you have those installed.
Once installed, you should be able to do `docker-compose up` and everything *should* kinda work. 

Currently, if you want to run the project in development mode (to see changes live), you'll need to run it outside of docker.
See [CONTRIBUTING](./CONTRIBUTING.md#running-the-project-for-development) for more information.

## admin flow

(TODO)

## user flow

This section walks through the experience of a new user joining your discord-based CTF.

### 1 - joining the main guild
First, the hopeful player will join the **main guild** registered to the CTF.
Nothing happens, but they get access to the **Terms of Service channel**, which is generated when a CTF is created.
They will need to agree to these terms in order to participate.

### 2 - accepting the terms of service
Once the user reacts affirmatively to the **Terms of Service**, ctfbot will automatically grant that user:
1. a **User** registration in the CTF
2. a **Team** registration that contains only the user and is assigned to the least full Team Server
3. the `@Participant` role, that grants access to challenge channels and user commands
4. a role that corresponds to the team server they have been added to, granting access to their team server channel
5. a channel in that team server corresponding to their team
6. for users that have DMs enabled, they will also be sent an invite link to their new team server

### 3 - joining their team server
When the user joins their team server, they will arrive in a landing channel with a short
explanation on where to find challenges and how to change team servers.
They will immediately be granted their team role and have access to their team channel, where they can submit challenges.

If they join the wrong team server, they will be kicked and directed (via DM) to their real team server.

### 4 - adding people to their team
The original member of a team can expand their team by using the `/team invite DISCORD_USER` command.
You may only invite users that have already accepted TOS.
The invited user will receive your invitation in their team chat, and they can accept by reacting to the message.

The user will also receive a notice of the invite as a DM (if they have DMs turned on).

Once you have added a user to your team, they will be kicked out of their channels, chats, and roles and added to your team's resources.

### 5 - submitting challenges
The user can attempt a challenge by viewing a **challenge channel** in their **team server**.
All necessary information should be contained there.

Once the challenge is complete, they should submit the flag using the `/submit` command, preferably in their team channel.

When a challenge is submitted, the solve will be announced in the team channel,
and the user may be granted access to an additional challenge channel, if another challenge was unlocked.

### 6 - checking status
The user can always view the leaderboard channels in the **main guild**. 
There is a ~~top-in-each-category leaderboard~~ (TODO), and there is an overall leaderboard.
These are updated every two minutes.

The user can request their own standing in their team channel with `/standing`.

## commands

The bot is controlled primarily through [Slash Commands](https://discord.com/developers/docs/interactions/slash-commands). 

There are two kinds of commands, **administrative commands** and **user commands**.

Discord also makes a distinction between globally registered commands and per-guild commands. Most commands provided are per-guild commands, the bot will not respond to commands outside of a guild with which it is registered.

The only global commands are:
1. `/addctf`
2. `/addserver`

Once these commands are run in a particular server, the remaining per-guild commands will be added.

### administrative commands

To use the commands detailed in this section, your Discord user needs to either have created the CTF
or have the `CTF Admin` role that is created when the CTF is created. 

#### adding a new CTF
```java
/addctf NAME
```

This creates a new CTF in the guild you're currently in. It will create some meta channels for announcements and logging. Avoid deleting these categories and channels, but you can otherwise name them / rearrange them freely.

**Note**: there is a limit of one CTF per guild.

**Note 2**: until you *publish* the CTF by setting the start date and end date, challenges cannot be submitted by players.

**Note 3**: creating a ctf will also create a `CTF Admin` role that the initial user will be added to.

#### editing a CTF
```java
/ctf set name NAME
/ctf set start [START_DATE] // (TODO)
/ctf set end [END_DATE] // (TODO)
```

Edit various parameters of the current CTF.

~~Using `set start` without specifying a start date will cause the startdate to be set to "now".
This effectively *publishes* a CTF.
Likewise, using `set end` without specifying an end date will cause the current CTF to be closed immediately.~~

**Note:** the above has yet to be implemented.

#### removing a CTF
```java
/ctf del
```

This causes the removal of the current guild's CTF *and all associated Teams, Categories, and Challenges*. There is no going back.

#### managing team servers
```java
/addserver CTF_NAME
/ctf server del
```

The first command will add the current guild as a team server for the indicated CTF. Again, you must be an admin on the main CTF guild to run this command.

The second command will remove the indicated team server from the CTF it is a member of.

#### creating new categories
```java
/category add NAME
```

Creates a new category with the provided name. This automatically creates a channel category with the same name in the main CTF guild.

**Note**: Category names are **unique** per CTF.

#### editing categories
```java
/category set name NEW_NAME NAME
```

Edit the name of a category you identify by name.

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
* **Difficulty** defaults to *Easy*.

All of these settings can be changed in further commands.

**Note**: Challenge names are **unique** per CTF.

#### editing challenges
```java
/challenge set name NAME
/challenge set author AUTHOR
/challenge set prompt PROMPT
/challenge set difficulty DIFFICULTY
/challenge set publish [PUBLISH_TIME]
```

Edits the challenge variables in a predictable way. Each command infers the challenge from the current challenge channel.

**Note**: Using `set publish` without specifying a publish time will set it to "now", publishing the challenge instantly.


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

Removes the challenge based on the current challenge channel. *This causes all recorded attempts to solve this challenge to be deleted forever*.

#### managing flags
```java
/challenge flag add FLAGSTRING [POINTS]
/challenge flag del INDEX
/challenge flag points INDEX POINTS
```

The first command adds a flag to the current challenge. If no points are specified, it defaults to 0.

The second command removes the flag at the specified index.
This index begins at 1 instead of zero and matches the way the flags are numbered in the Discord UI.

The third command changes the number of points the indicated flag is worth.

### user commands

All users in the server are able to use these commands regardless of admin status

#### team management
```java
/setname NAME
```

Similar to the admin only commands, these take in no argument for team and will only affect
the user's current team. Non-admins will only be allowed to use this command in their specific
team channel, but the functionality will carry over.

#### ~~scoreboard~~ (TODO)
```java
/scoreboard top [CATEGORY]
/scoreboard team [TEAM_NAME]
/scoreboard standing [TEAM_NAME]
```

First command prints a scoreboard detailing the top 20 teams and their total points in the specified
category. If no category is specified, it will instead list the top 20 teams overall in the CTF.

Second command gives info about a specific team, detailing their info (name, description, members,
etc.) and their standing along with total points and attempt correct percentage. If no team is specified,
it bases it on the user's current team.

Third command gives a view similar to top for the specified team, listing the 9 teams above and below
the specified team overall and their names, points, and place values. If no team is specified, the user's
team will be inferred.

#### challenges
```java
/submit FLAG
```

Allows a user to submit a flag. If it matches some challenge, the flag is captured.
