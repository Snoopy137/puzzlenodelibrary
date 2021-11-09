import { schedule } from 'node-cron';
import { EventEmitter } from 'events';
import { mail } from './mail.admin';

export const reporter = new EventEmitter();

export const foo = schedule(' * * * * *', () => {
    reporter.emit('weekReport');
});

reporter.on('weekReport', () => new mail().createMessage());