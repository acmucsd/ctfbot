export default (...message: string[]) => {
  // eslint-disable-next-line no-console
  console.log(
    '[\u001b[34mctfbot\u001b[0m]\u001b[33m',
    new Date(),
    '\u001b[0m-',
    ...message.map((msg) => msg.toString().replace(/\*/g, '')),
  );
};
