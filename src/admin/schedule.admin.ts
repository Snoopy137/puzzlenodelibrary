import { schedule } from 'node-cron';
import { EventEmitter } from 'events';
import { Mail } from './mail.admin';

export const reporter = new EventEmitter();

export const foo = schedule(' * * * * 6', () => {
    reporter.emit('weekReport');
});

reporter.on('weekReport', () => new Mail().sendMailToAdmin());
reporter.on('weekReport', () => new Mail().sendMailToUser());