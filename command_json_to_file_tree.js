const fs = require('fs');
const file = require('./commands.json');

const { commands } = file; // object[]

// path = path + obj.name
const meta = (obj, path) => {
  // sub command
  if (obj.type === 1) {
    fs.mkdirSync(`${path}/${obj.name}`);

    const importSet = new Set(['Message']);
    (obj.options || []).forEach((option) => {
      switch (option.type) {
        case 6:
          importSet.add('User');
          break;
        case 7:
          importSet.add('Channel');
          break;
        case 8:
          importSet.add('Role');
          break;
      }
    });
    const imports = `import { ${[...importSet].sort().join(', ')} } from 'discord.js';\n`;

    const paramList = `(message: Message${(obj.options || []).reduce((concat, curr) => {
      // eslint-ignore-next
      switch (curr.type) {
        case 3:
          return `${concat}, ${curr.name}${curr.required ? '' : '?'}: string`;
        case 4:
          return `${concat}, ${curr.name}${curr.required ? '' : '?'}: number`;
        case 5:
          return `${concat}, ${curr.name}${curr.required ? '' : '?'}: boolean`;
        case 6:
          return `${concat}, ${curr.name}${curr.required ? '' : '?'}: User`;
        case 7:
          return `${concat}, ${curr.name}${curr.required ? '' : '?'}: Channel`;
        case 8:
          return `${concat}, ${curr.name}${curr.required ? '' : '?'}: Role`;
        default:
          return concat;
      }
    }, '')})`;

    fs.writeFileSync(`${path}/${obj.name}/${obj.name}.ts`, `${imports}\nconst ${obj.name} = ${paramList} => { };\n\nexport default ${obj.name};\n`);
    fs.writeFileSync(`${path}/${obj.name}/index.ts`, `export { default } from './${obj.name}';\n`);
  }
  // group || top-level
  else if (obj.type === 2 || obj.type === undefined) {
    fs.mkdirSync(`${path}/${obj.name}`);

    let imports = 'import { Message } from \'discord.js\';\n';

    if (obj.options.length) {
      obj.options.forEach((option) => {
        meta(option, `${path}/${obj.name}`);
        imports += `\nimport ${option.name} from './${option.name}';`;
      });

      imports += '\n';
    }

    fs.writeFileSync(`${path}/${obj.name}/${obj.name}.ts`, `${imports}\nconst ${obj.name} = (message: Message) => { };\n\nexport default ${obj.name};\n`);
    fs.writeFileSync(`${path}/${obj.name}/index.ts`, `export { default } from './${obj.name}';\n`);
  }
};

const path = 'src/events/message/commands';

fs.writeFileSync(`./${path}/index.ts`, `${commands.reduce((concat, curr) => `${concat}export { default as ${curr.name} } from './${curr.name}';\n`, '')}`);
commands.forEach((command) => {
  meta(command, `${path}`);
});
