import { schedule } from 'node-cron';
import { EventEmitter } from 'events';

export const reporter = new EventEmitter();

//reporter.on('weekReport', () => test());

export const foo = schedule('*/5 * * * * *', () => {
    reporter.emit('weekReport');
    reporter.emit('test');
});

function test() {
    console.log('emitter on weekreport');
}