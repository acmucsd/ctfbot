import { MessageEmbed, TextChannel } from 'discord.js';

export async function sendTeamChannelLandingMessage(teamChannel: TextChannel) {
  const message = new MessageEmbed();
  message.setTitle(`Welcome to your Team Channel`);
  message.setColor('#50c0bf');

  message.setDescription(`This channel has been allocated just for your team to collaborate.`);

  message.addField(
    'Where are the challenges?',
    `All the challenges and their information are stored as **channels** in this Discord server. They are organized into categories. If you cannot see them, it is because *the CTF has not started yet*.`,
  );
  message.addField(
    'How do I submit flags?',
    `Inside of each Challenge Channel, there is a button at the bottom called "**Submit a Flag**" that will bring up a text input prompt where you can enter the flag.

If that doesn't work, you can also use the \`/submit\` command, which accepts your flag as the single argument.`,
  );
  message.addField(
    'How to I invite people to my team?',
    `1. Make sure they have joined the **main server** and **accepted the Terms of Service**.
2. Right click on their user **in the main server** and select "Apps > **Invite to your Team**"

They should receive a Direct Message inviting them to your team. If they accept, they'll be relocated to your **Team Server** and **Team Channel**.`,
  );
  message.addField(
    'How do I set my team name?',
    `Use the \`/setname\` command to change the name of your team into whatever you want. **This will be the team name submitted to CTFtime.org at the end of the competition**.`,
  );
  message.addField(
    "How do I see my team's progress?",
    `Use the \`/standing\` command in this **Team Channel**. If the CTF hasn't started yet, this won't tell you much.`,
  );
  message.setTimestamp();

  const mess = await teamChannel.send({ embeds: [message] });
  await mess.pin();
}
