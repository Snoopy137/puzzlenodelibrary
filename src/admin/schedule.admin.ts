import { schedule } from 'node-cron';
import { EventEmitter } from 'events';

export const reporter = new EventEmitter();

export const foo = schedule('*/3 * * * * *', () => {
    reporter.emit('weekReport');
});