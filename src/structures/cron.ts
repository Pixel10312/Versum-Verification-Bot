import { CronType } from '../typings/cron';
import { client } from '../index';

export class Cron {
  constructor(options: CronType) {
    Object.assign(this, options);
  }
}
