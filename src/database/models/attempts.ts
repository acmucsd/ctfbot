import query from '../database';
import { AttemptsRow } from '../schemas/attempts';

export default class Attempts {
  row: AttemptsRow;

  constructor(row: AttemptsRow) {
    this.row = row;
  }
}
