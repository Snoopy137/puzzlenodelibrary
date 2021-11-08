import { schedule } from 'node-cron';
import { EventEmitter } from 'events';
import { mail } from './mail.admin';

export const reporter = new EventEmitter();

export const foo = schedule('*/3 * * * * *', () => {
    reporter.emit('weekReport');
});

reporter.on('weekReport', () => new mail().sendMail1('alandsn137@gmail.com'));