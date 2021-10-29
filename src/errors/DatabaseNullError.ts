import CTFBotError from './index';

class DatabaseNullError extends CTFBotError {
  fieldName: string;

  constructor(fieldName: string, message: string) {
    super(message, 'DatabaseNullError');
    this.fieldName = fieldName;
  }
}

export const createDatabaseNullError = (fieldName: string) =>
  new DatabaseNullError(fieldName, 'the model field was unexpected null');
