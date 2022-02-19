import { DatabaseNullError } from "./DatabaseNullError";

class DiscordNullError extends DatabaseNullError {
  fieldName: string;

  constructor(fieldName: string, message: string) {
    super(message, 'DiscordNullError');
    this.fieldName = fieldName;
  }
}

export const createDiscordNullError = (fieldName: string) =>
  new DatabaseNullError(fieldName, 'the discord resource has yet to be created...please try again in a minute');
