import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { getCtfByGuildContext } from '../../../../util/ResourceManager';
import axios from 'axios';
import { parse } from 'csv-parse';
import { parse as parseTime } from 'date-fns';
import ReadableStream = NodeJS.ReadableStream;
import { Category } from '../../../../../database/models/Category';
import { Challenge } from '../../../../../database/models/Challenge';

export default {
  name: 'fromcsv',
  description: 'Import challenges from a spreadsheet. See README for full format.',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'url',
      description: 'url to download the spreadsheet',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await getCtfByGuildContext(interaction.guild);
    if (!ctf) return `This guild is not associated with any CTFs`;

    // warning: offensive levels of hack and jank lie ahead
    // you have been warned

    const url = interaction.options.getString('url', true);
    const response = await axios.get(url, {
      responseType: 'stream',
    });
    const csvStream = response.data as ReadableStream;
    const parser = csvStream.pipe(parse({ columns: true, bom: true }));

    // for each row in the spreadsheet
    for await (const record of parser) {
      const typedRecord = record as { [key: string]: string };
      const categoryName = typedRecord.category;
      const challengeName = typedRecord.name;

      // we do need, at a minimum, a name and category column
      if (!challengeName || !categoryName) continue;

      // create the category if it doesn't already exist
      const category =
        (await Category.findOne({ where: { name: categoryName.toUpperCase() } })) ||
        (await ctf.createCategory({ name: categoryName.toUpperCase() }));

      // create the challenge if it doesn't already exist
      const challenge =
        (await Challenge.findOne({ where: { name: challengeName } })) ||
        (await category.createChallenge({ name: challengeName }));

      if (typedRecord.author) challenge.author = typedRecord.author;
      if (typedRecord.prompt) challenge.prompt = typedRecord.prompt;
      if (typedRecord.difficulty) challenge.difficulty = typedRecord.difficulty;

      // if the publish time is defined, we have to try and parse it sadly
      if (typedRecord.publishTime) {
        const parsedTime = parseTime(typedRecord.publishTime, 'yyyy MM dd HH:mm', new Date());
        if (parsedTime.toString() !== 'Invalid Date') challenge.publishTime = parsedTime;
      }

      if (typedRecord.flags) {
        // TODO: add the flag(s) to the challenge
        // having multiple potential flags makes this a bit...tricky
      }

      await challenge.save();
    }

    return `Challenges imported from CSV`;
  },
} as ExecutableSubCommandData;
